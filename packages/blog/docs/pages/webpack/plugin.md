
###  4 插件

<!-- plugins
在 webpack 运行到某个时刻可以自动执行

html-webpack-plugin
clean-webpack-plugin

soucemap

dev-tool - n 种



devServer

webpack.HotModuleReplacePlugin


TreeShaking   只支持es module   
配置 optimization : { usedExports:true }    
对于babel 或 css  使用sideEffects 属性.. 使模块不受没有导出而被删除的限制
在dev模式底下..并不会直接将shaking的函数直接删除 而是做提示



code splitting
通过插件配置将代码根据不能业务 拆分不同文件

1. 配置 optimization : { splitChunks:{

} }

默认使用了 spliTChunk

2. import 异步加载的分割

 -->

 可以加载插件的常用对象:
 Compiler          run.comoile.comoilation.make.emit.done
Comoilation         buildModule,normalModuleLoader,successModule,finishMoudules..seal..optimize,,after-seal

moduleFactory      beforeResolver/afterResolver/moudle/parser
moudle  

parser    promarm   statement  call  expression

template  hash  bootstrap  localCVars  render




/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const util = require("util");
const SyncBailHook = require("./SyncBailHook");

function Tapable() {
	this._pluginCompat = new SyncBailHook(["options"]);
	this._pluginCompat.tap(
		{
			name: "Tapable camelCase",
			stage: 100
		},
		options => {
			options.names.add(
				options.name.replace(/[- ]([a-z])/g, (str, ch) => ch.toUpperCase())
			);
		}
	);
	this._pluginCompat.tap(
		{
			name: "Tapable this.hooks",
			stage: 200
		},
		options => {
			let hook;
			for (const name of options.names) {
				hook = this.hooks[name];
				if (hook !== undefined) {
					break;
				}
			}
			if (hook !== undefined) {
				const tapOpt = {
					name: options.fn.name || "unnamed compat plugin",
					stage: options.stage || 0
				};
				if (options.async) hook.tapAsync(tapOpt, options.fn);
				else hook.tap(tapOpt, options.fn);
				return true;
			}
		}
	);
}
module.exports = Tapable;

Tapable.addCompatLayer = function addCompatLayer(instance) {
	Tapable.call(instance);
	instance.plugin = Tapable.prototype.plugin;
	instance.apply = Tapable.prototype.apply;
};

Tapable.prototype.plugin = util.deprecate(function plugin(name, fn) {
	if (Array.isArray(name)) {
		name.forEach(function(name) {
			this.plugin(name, fn);
		}, this);
		return;
	}
	const result = this._pluginCompat.call({
		name: name,
		fn: fn,
		names: new Set([name])
	});
	if (!result) {
		throw new Error(
			`Plugin could not be registered at '${name}'. Hook was not found.\n` +
				"BREAKING CHANGE: There need to exist a hook at 'this.hooks'. " +
				"To create a compatibility layer for this hook, hook into 'this._pluginCompat'."
		);
	}
}, "Tapable.plugin is deprecated. Use new API on `.hooks` instead");

Tapable.prototype.apply = util.deprecate(function apply() {
	for (var i = 0; i < arguments.length; i++) {
		arguments[i].apply(this);
	}
}, "Tapable.apply is deprecated. Call apply on the plugin directly instead");