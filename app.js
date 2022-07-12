const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const dirImgName = './img/';

const addTextWatermarkToImage = async function (inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    const textData = {
      text: text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };

    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    await image.quality(100).writeAsync(outputFile);
  }
  catch (error) {
    console.log('Something went wrong.')
  }
};

const addImageWatermarkToImage = async function (inputFile, outputFile, watermarkFile) {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);
  }
  catch (error) {
    console.log('Something went wrong.')
  }
};

const prepareOutputFilename = (filename) => {
  const [name, ext] = filename.split('.');
  return `${name}-watermarked.${ext}`;
}

const otherImageConversions = async function (inputFile, outputFile, type) {
  try {
    const image = await Jimp.read(inputFile);
    if (type === 'contrast') await image.contrast(1).writeAsync(outputFile);
    if (type === 'brightness') await image.brightness(0.1).writeAsync(outputFile);
    if (type === 'greyscale') await image.greyscale().writeAsync(outputFile);
    if (type === 'invert') await image.invert().writeAsync(outputFile);
  }
  catch (error) {
    console.log('Something went wrong.')
  }
}

const startApp = async () => {
  const answer = await inquirer.prompt([{
    name: 'start',
    message: 'Welcome to "Watermark utility". Copy images to `' + dirImgName + '` folder to use them. Are you ready?',
    type: 'confirm'
  }]);

  if (!answer.start) process.exit();

  const options = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'File do you want to mark?',
    default: 'test.jpg',
  }]);

  const optionsOther = await inquirer.prompt([{
    name: 'type',
    type: 'list',
    message: 'edit a picture?',
    choices: ['No', 'Increase brightnes', 'Increase contrast', 'Convert to B&W', 'Invert image'],
  }]);

  const originalImage = dirImgName + options.inputImage;
  const outputImage = dirImgName + prepareOutputFilename(options.inputImage);
  let inputImage = dirImgName + options.inputImage;

  switch (optionsOther.type) {
    case 'Increase brightnes':
      if (fs.existsSync(originalImage))
        otherImageConversions(inputImage, outputImage, 'brightness');
      else
        console.log('Something went wrong.');
      break;
    case 'Increase contrast':
      if (fs.existsSync(originalImage))
        otherImageConversions(inputImage, outputImage, 'contrast');
      else
        console.log('Something went wrong.');
      break;
    case 'Convert to B&W':
      if (fs.existsSync(originalImage))
        otherImageConversions(inputImage, outputImage, 'greyscale');
      else
        console.log('Something went wrong.');
      break;
    case 'Invert image':
      if (fs.existsSync(originalImage))
        otherImageConversions(inputImage, outputImage, 'invert');
      else
        console.log('Something went wrong.');
      break;
  }

  if (optionsOther.type !== 'No') inputImage = dirImgName + prepareOutputFilename(options.inputImage);

  const optionsWatermark = await inquirer.prompt([{
    name: 'type',
    type: 'list',
    message: 'Choose type of watermark?',
    choices: ['Text', 'Image'],
  }]);

  if (optionsWatermark.type === 'Text') {
    const text = await inquirer.prompt([{
      name: 'value',
      type: 'input',
      message: 'Enter watermark text:',
    }])
    options.watermarkText = text.value;

    if (fs.existsSync(originalImage))
      addTextWatermarkToImage(inputImage, outputImage, options.watermarkText);
    else
      console.log('Something went wrong.');
  }
  else {
    const image = await inquirer.prompt([{
      name: 'filename',
      type: 'input',
      message: 'Enter watermark name:',
      default: 'logo.png',
    }])
    options.watermarkImage = image.filename;
    if (fs.existsSync(originalImage) && fs.existsSync(dirImgName + options.watermarkImage))
      addImageWatermarkToImage(inputImage, outputImage, dirImgName + options.watermarkImage);
    else
      console.log('Something went wrong.');
  }
  console.log('Done.');
  startApp();
};

startApp();
