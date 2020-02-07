var sky = [];
var links = [];
var linkA = null;

var IDSPACE = 16384;

class Star {
    get element() {
        return this._element;
    }

    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
        this._refresh();
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
        this._refresh();
    }

    get size() {
        return this._size;
    }
    set size(value) {
        this._size = value;
        this._refresh();
    }

    get colour() {
        return this._colour;
    }
    set colour(value) {
        this._colour = value;
        this._refresh();
    }

    constructor(x, y, size, id, colour="#ffffff", debug=true) {
        this._x = x;
        this._y = y;
        this._size = size;
        this._colour = colour;
        this._id = id;
        this._links = [];
        this.debug = debug;
        let canvas = document.getElementById("canvas");
        canvas.insertAdjacentHTML("beforeend", '<g id="star' + this._id.toString() + '" class="star" style="fill:' + colour + ';transform-origin:' + x.toString() + 'px ' + y.toString() + 'px" transform="scale(' + size.toString() + ') translate(' + x.toString() + ',' + y.toString() + ')"><circle r="1" class="outer"></circle><circle r="1"></circle></g>');
        this._element = document.getElementById("star" + this._id.toString());
        this.element.addEventListener('click', e => {this.onclick(this, e);});
        var e = this.element;
        setTimeout(function() {
            e.firstChild.style.animationPlayState = "running";
        }, Math.random() * 5000);
    }
    _refresh() {
        this.element.setAttribute("transform", 'scale(' + this._size.toString() + ') translate(' + this._x.toString() + ',' + this._y.toString() + ')');
        this.element.setAttribute("style", 'fill:' + this._colour + ';transform-origin:' + this._x.toString() + 'px ' + this._y.toString() + 'px');
        for (let i = 0; i < this._links.length; i++) {
            this._links[i]._refresh();
        }
    }

    onclick(self, e) {
        console.log("Star clicked at (" + self.x.toString() + ", " + self.y.toString() + ").");
        if (linkA) {
            if (linkA != self) {
                if (linkA.x <= self.x) {
                    if (linkA.y <= self.y) {
                        links.push(new Linker(linkA, self));
                    } else {
                        links.push(new Linker(self, linkA));
                    }
                } else {
                    links.push(new Linker(self, linkA));
                }
            }
            linkA = null;
        } else {
            linkA = self;
        }
    }
}

class Linker {
    get element() {
        return this._element;
    }

    get thickness() {
        return this._thickness;
    }
    set thickness(value) {
        this._thickness = value;
        this._refresh();
    }

    constructor(pointA, pointB) {
        this.colour = "rgba(255, 255, 255, 0.5)"
        this._origin = pointA;
        this._dest = pointB;
        pointA._links.push(this);
        pointB._links.push(this);
        this._num = pointA._id * IDSPACE + pointB._id;
        this._thickness = 4;
        this._x = this._origin.x - this._thickness / 2;
        this._y = this._origin.y;
        this._dx = this._dest.x - this._thickness / 2;
        this._dy = this._dest.y;
        this._length = Math.sqrt(Math.pow(this._x - this._dx, 2) + Math.pow(this._y - this._dy, 2));
        this._rotation = Math.atan((this._y - this._dy) / (this._x - this._dx)) * 180 / Math.PI;
        let code = '<rect id="link' + this._num + '" class="link" x="' + this._x.toString() + '" y="' + this._y.toString() + '" width="' + this._thickness.toString() + '" height="' + this._length.toString() + '" style="fill:' + this.colour + ';transform-origin:' + (this._x + this._thickness / 2).toString() + 'px ' + this._y.toString() + 'px" transform="rotate(' + (this._rotation - 90).toString() + ')"></rect>';
        var back = document.getElementById("back");
        back.insertAdjacentHTML("afterend", code);
        this._element = document.getElementById("link" + this._num);
    }

    queryPoint(node) {
        if (node == this._origin) {
            return 1;
        } else if (node == this._dest) {
            return 2;
        } else {
            return 0;
        }
    }

    _refresh() {
        this._x = this._origin.x - this._thickness / 2;
        this._y = this._origin.y;
        this._dx = this._dest.x - this._thickness / 2;
        this._dy = this._dest.y;
        this._length = Math.sqrt(Math.pow(this._x - this._dx, 2) + Math.pow(this._y - this._dy, 2));
        this._rotation = Math.atan((this._y - this._dy) / (this._x - this._dx)) * 180 / Math.PI;
        this.element.setAttribute("x", this._x.toString());
        this.element.setAttribute("y", this._y.toString());
        this.element.setAttribute("width", this._thickness.toString());
        this.element.setAttribute("height", this._length.toString());
        this.element.setAttribute("style", 'fill:' + this.colour + ';transform-origin:' + (this._x + this._thickness / 2).toString() + 'px ' + this._y.toString() + 'px');
        this.element.setAttribute("transform", 'rotate(' + (this._rotation - 90).toString() + ')');
    }
}

function start(mapper, callback) {
    var stars = mapper();
    for (let i = 0; i < stars.length; i++) {
        sky.push(new Star(stars[i][0], stars[i][1], stars[i][2], sky.length));
    }
    document.addEventListener("keydown", function calculate(e) {
        if (e.key == "Enter") {
            var final = new Uint8Array(links.length * 4);
            links.sort((a, b) => a._num - b._num);
            for (let i = 0; i < links.length; i++) {
                final[i * 4] = links[i]._origin.x / 8;
                final[i * 4 + 1] = links[i]._origin.y / 4;
                final[i * 4 + 2] = links[i]._dest.x / 8;
                final[i * 4 + 3] = links[i]._dest.y / 4;
            }
            callback(final);
        }
    });
}