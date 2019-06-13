const getClusters = (request, response) => {
  if (!request.body) {
    return response.sendStatus(400);
  }
  const dictionary = request.body['dictionary'];
  if (!dictionary) {
    return response.status(500).json({
      success: false,
      data: {message: 'Empty dictionary!'}
    });
  }
  const pathToInterpreter = 'C:/Users/hp1/Documents/Python/venv3.6/Scripts/python.exe';
  const pathToFile = 'C:/Users/hp1/Documents/Python/main.py';

  const args = [];
  dictionary.forEach(array => {
    args.push(JSON.stringify(array))
  });
  const options = {
    mode: 'text',
    pythonPath: pathToInterpreter,
    pythonOptions: ['-u'], // get print results in real-time
    args: args
  };

  const PythonShell = require('python-shell').PythonShell;

  PythonShell.run(pathToFile, options, function (err, data) {
    if (err) {
      return response.status(500).json({
        success: false,
        data: {message: 'Error while trying to execute python script'}
      });
    }
    response.status(200).json(JSON.parse(data.toString()))
  });
};

module.exports = {
  getClusters
};
