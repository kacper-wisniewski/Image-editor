const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const startApp = async () => {
  const answer = await inquirer.prompt([{
    name: 'start',
    message: 'Hi! Welcome to Watermark Studio. Copy your image files to `/img` folder. Then you`ll be able to use them in app. Are you ready?',
    type: 'confirm',
  }]);

  if(!answer.start) process.exit();
  const options = await inquirer.prompt([{
    name: 'inputFile',
    type: 'input',
    message: 'What file do you want to mark?',
    default: 'test.jpg',
  }, {
    name: 'edit',
    message: 'Do you want to edit image?',
    type: 'confirm',
  }, {
    name: 'watermarkType',
    type: 'list',
    choices: ['Text watermark', 'Image watermark'],
  }]);
  if(!fs.existsSync(`./img/${options.inputFile}`)) {
    console.log('Chosen file doesn`t exist');
    process.exit();
  }
  if(options.edit) {
    const image = await inquirer.prompt([{
      name: 'editType',
      type: 'list',
      choices: ['make image brighter', 'increase contrast', 'make image b&w', 'invert image'],
    }]);
    options.editType = image.editType;
    editImage(`./img/${options.inputFile}`, `edited-${options.inputFile}`, options.editType);
  }
  if(options.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([{
      name: 'value',
      type: 'input',
      message: 'Type your watermark text',
      default: 'Your watermark',
    }]);
    options.watermarkText = text.value;
    addTextWatermarkToImage(`./img/${options.inputFile}`, prepareOutputFilename(options.inputFile), options.watermarkText);
  } else {
    const image = await inquirer.prompt([{
      name: 'filename',
      type: 'input',
      message: 'Type your watermark name',
      default: 'logo.png',
    }]);
    options.watermarkImage = image.filename;
    if(!fs.existsSync(`./img/${options.watermarkImage}`)) {
      console.log('Chosen file doesn`t exist');
      process.exit();
    }
    addImageWatermarkToImage(`./img/${options.inputFile}`, prepareOutputFilename(options.inputFile), `./img/${options.watermarkImage}`);
  }
  console.log('Your image is ready!');
};

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const textData = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };
    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    await image.quality(100).writeAsync(outputFile);
  }
  catch {
    console.log('Something went wrong... Try again!');
  }
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermark) {
  try {
    const image = await Jimp.read(inputFile);
    const watermarkImage = await Jimp.read(watermark);

    const x = image.getWidth() / 2 - watermarkImage.getWidth() / 2;
    const y = image.getHeight() / 2 - watermarkImage.getHeight() / 2; 

    image.composite(watermarkImage, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);
  }
  catch {
    console.log('Something went wrong... Try again!');
  }
};

const prepareOutputFilename = (inputName) => {
  const [ outputName, outputExt ] = inputName.split('.');
  return `${outputName}-w-watermark.${outputExt}`;
};

const editImage = async function(inputFile, outputFile, editType) {
  try {
  const image = await Jimp.read(inputFile);
    if(editType === 'make image brighter') {  
      await image.brightness(0.1).quality(100).writeAsync(outputFile);
    } else if(editType === 'increase contrast') {
      await image.contrast(0.1).quality(100).writeAsync(outputFile);
    } else if(editType === 'make image b&w') {
      await image.greyscale().quality(100).writeAsync(outputFile);
    } else {
      await image.invert().quality(100).writeAsync(outputFile);
    }

  }
  catch {
    console.log('Something went wrong... Try again!');
  }
};

startApp();
