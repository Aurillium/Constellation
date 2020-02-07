function starMap() {
    var map = [];
    for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 32; j++) {
            map.push([i * 64, j * 64, 8]);
        }
    }
    return map;
}