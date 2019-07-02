/*
text:
options:
{
    width: width,
    scale: width ? 4 : scale,
    margin: margin,
    color: {
      dark: hex2rgba(options.color.dark || '#000000ff'),
      light: hex2rgba(options.color.light || '#ffffffff')
    },
    type: options.type,
    rendererOpts: options.rendererOpts || {}
}
cb:
*/
var qrcode = require('qrcode')
exports.render = function (text, options, cb) {
  var qrData = qrcode.create(text, {})
  var size = qrData.modules.size
  var data = qrData.modules.data

  // var opts = Utils.getOptions(options)

  // use same scheme as https://github.com/gtanner/qrcode-terminal because it actually works! =)
  var black = options.color.dark  || '\x1b[40m  \x1b[0m'
  var white = options.color.light || '\x1b[47m  \x1b[0m'

  var output = ''
  var hMargin = Array(size + 3).join(white)
  var vMargin = Array(2).join(white)

  output += hMargin + '\n'
  for (var i = 0; i < size; ++i) {
    output += white
    for (var j = 0; j < size; j++) {
      // var topModule = data[i * size + j]
      // var bottomModule = data[(i + 1) * size + j]

      output += data[i * size + j] ? black : white// getBlockChar(topModule, bottomModule)
    }
    // output += white+'\n'
    output += vMargin + '\n'
  }

  output += hMargin + '\n'

  if (typeof cb === 'function') {
    cb(null, output)
  }

  return output
}