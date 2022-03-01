# openfaas-node16-typescript
The **OpenFaas template** with Node 16 and TypeScript support and handler function types.

## Install faas-cli
In order to run this template you need to install openfaas and faas-cli. Instructions here: https://docs.openfaas.com/cli/install/

## How to install this template
1. Run `faas-cli template pull https://github.com/pawelotto/openfaas-node16-typescript`
2. Run `faas-cli new --list` to verify the template has been added as `node16-typescript` language
3. Run `faas-cli new <your_function_name> --lang node16-typescript` to scaffold the function directory and files
4. Edit the `<your_function_name>.yml` file: 
- add `/dist` at the end of the handler entry because that's where your output handler.js file will be built to
- specify your Docker repo in the `image` yaml entry.
If you're using a private Docker repo make sure to add your secret to the openfaas cluster: (https://docs.openfaas.com/reference/private-registries/)
5. Chdir to `<your_function_name>` and run `yarn` to install dependencies
6. Edit `<your_function_name>/src/handler.ts` to match your needs
7. Run `yarn faas:build` to compile ts sources and copy package.json file
8. Chdir up to main dir and run `faas-cli up -f <your_function_name>.yml` to build, push and deploy your function
