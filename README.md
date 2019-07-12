# ExtES #
This library provides many different tiny and handy tools to provide mechanisms that native js lacks!

## A very important note ##
This library will overwrite or expand the native js objects! Use it carefully...

## Use in browser environment ##
The library is directly provided by [JSDeliver](https://cdn.jsdelivr.net/gh/JCloudYu/extes/).
Hence, simply use the following line in browser environment to import and inject all the tools.
```javascript
import "//cdn.jsdelivr.net/gh/JCloudYu/extes/extes.esm.js";
```

## Use in NodeJS environment ##
Since that this library is completely written using es module syntax, using this library in NodeJS environment is a little bit tricky.
Please follow the following steps to install and use this library!

1. Install the package via following line.
	```sh
	npm install extes
	```
2. Download the following loader script from [here](https://gist.github.com/JCloudYu/87b4a5caff65320557452167e3466dbb) and name it as **_loader.mjs_**
3. You can use this line in your code to import and inject all the tools.
	```javascript
	import "extes";
	```
	
4. Run the script using following command
	```sh
	node --experimental-modules --loader ./loader.mjs [PATH_TO_YOUR_BOOT_SCRIPT]
	```

The loader script is used to tell the NodeJS environment to load the scripts ended with .esm.js as es modules not CommonJS modules.
The reason why I'm not using .mjs is that I want to make the scripts to be directly identified by web browsers without the need to add 
additional configuration to make the server respond correct content-type header. 'cause it will be difficult to do that if you're not hosting your own web server!

## Injected Tool List ##
### Object ###
- **Object.defineProperty**
- **Object.defineProperties**
- **Object.merge**
- **Object.generate**
- **Object.typeof**

### Promise ###
- **Promise.wait**
- **Promise.create**

### Timers ###
- **setTimeout.create**
- **setInterval.create**
- **setInterval.idle**
