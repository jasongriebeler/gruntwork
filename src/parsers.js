
module.exports.parseSingleDateTitle = function(input){
    // something kinda like: 'W/O – 10.10.19'
    return input.replace(/\./g, '-')
    .replace(/\//g, '')
    .replace(/\s/g, '');
}