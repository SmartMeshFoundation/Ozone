# About Ozone

The project demonstrates how to access and use *Spectrum* network infrastructure.

# Objective

The goal is to expose the functionality of the various modules in the *Spectrum* network infrastructure to developers, enabling third-party developers to easily port their services to enrich the *Spectrum* ecosystem.

# Development

First, we install Quasar CLI. Make sure you have Node >=8 and NPM >=5 installed on your machine. If you want to learn what Quasar is and what it can do for you, read the [Introduction to Quasar](http://quasar-framework.org/guide/introduction-to-quasar.html). Otherwise, let’s get started.

```bash
# make sure you have vue-cli globally installed
$ yarn global add vue-cli

# Node.js >= 8.9.0 is required.
$ yarn global add quasar-cli

or

$ npm install -g vue-cli
$ npm install -g quasar-cli
```

Then, we checkout the source code of Ozone from github.
```bash
git clone https://github.com/SmartMeshFoundation/Ozone.git
```

### Run Ozone

Now you're ready to initialise Ozone for development:

```bash
$ cd Ozone
$ yarn install
$ yarn dev
```

For development we need a *Spectrum* node running. Start the `smc` in a separate terminal window:
```bash
$ smc --testnet --ws console
```

### Issues
---
- If you encounter that the chain data cann't sync, maybe you need to get the lastest of *Spectrum* source code from [github repo](https://github.com/SmartMeshFoundation/Spectrum), and recompile it.
