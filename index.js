const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const deleteFolderRecursive = function(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
    }
};

if (process.argv.length < 3) {
    console.log('You have to provide a name to your app.');
    console.log('For example :');
    console.log('    npx create-cloudgate-app my-app');
    process.exit(1);
}

const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);
const git_repo = "https://github.com/elestio/cloudgate-app";

try {
    fs.mkdirSync(projectPath);
} catch (err) {
    if (err.code === 'EEXIST') {
        console.log(`The folder ${projectName} already exist in the current directory, please give it another name.`);
    } else {
        console.log(err);
    }
    process.exit(1);
}

async function main() {
    try {
        console.log('Downloading files...');
        execSync(`git clone --depth 1 ${git_repo} ${projectPath}`);

        process.chdir(projectPath);

        console.log('Installing dependencies...');
        execSync('npm install --loglevel=error');
        deleteFolderRecursive(projectPath + "/.git");
        deleteFolderRecursive(projectPath + "/node_modules/aws-sdk");

        console.log('Your new project is ready');
        console.log('type: cd ' + projectName + " && ./run.sh");

    } catch (error) {
        console.log(error);
    }
}
main();