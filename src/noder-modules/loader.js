var promise = require('noder-js/promise');
var request = require('noder-js/request');
var typeUtils = require('noder-js/type');
var findRequires = require('noder-js/findRequires');
var scriptBaseUrl = require('noder-js/scriptBaseUrl');
var ParentLoader = require('noder-js/loader');

var bind = function (fn, scope) {
    return function () {
        return fn.apply(scope, arguments);
    };
};

var oldATClassRequiresPropName = "_ATModuleRequires";
var defaultLoaderInstance = function (module, content) {
    // isOldATClass may have called findRequires with the same content
    // here, we reuse the result of isOldATClass in case it is available to avoid
    // calling findRequires twice
    var dependencies = module[oldATClassRequiresPropName];
    delete module[oldATClassRequiresPropName];
    return {
        definition : content,
        dependencies : dependencies
    };
};

var Loader = function (context) {
    var config = context.config.packaging || {};
    var ariatemplates = config.ariatemplates;
    if (!ariatemplates) {
        return new ParentLoader(context);
    }
    if (!context.config.packaging) {
        context.config.packaging = config;
    }
    var Aria = global.Aria || {};
    global.Aria = Aria;
    if (Aria.rootFolderPath == null && config.baseUrl == null) {
        var rootFolderPath = scriptBaseUrl();
        rootFolderPath = rootFolderPath.replace(/\/aria(templates)?\/$/, "/");
        Aria.rootFolderPath = config.baseUrl = rootFolderPath;
    } else if (Aria.rootFolderPath == null) {
        Aria.rootFolderPath = config.baseUrl;
    } else if (config.baseUrl == null) {
        config.baseUrl = Aria.rootFolderPath;
    }

    this.parentLoader = new ParentLoader(context);
    this.parentLoader.loadUnpackaged = bind(this.loadUnpackaged, this);

    this.context = context;
    this.templateClassLoaders = {
        ".tpl" : {
            path : "ariatemplates/core/loaders/TplLoader.js"
        },
        ".tpl.css" : {
            path : "ariatemplates/core/loaders/CSSLoader.js"
        },
        ".tpl.txt" : {
            path : "ariatemplates/core/loaders/TxtLoader.js"
        },
        ".cml" : {
            path : "ariatemplates/core/loaders/CmlLoader.js"
        },
        ".tml" : {
            path : "ariatemplates/core/loaders/TmlLoader.js"
        }
    };
    this.oldATClassLoader = {
        path : "ariatemplates/core/loaders/OldATLoader.js"
    };
    this.oldATClassRegExp = /Aria\s*\.\s*(class|interface|bean|tplScript)Definition(s?)\s*\(/;
    this.defaultLoader = {
        instance : defaultLoaderInstance
    };
    this.downloadMgr = {
        path : "ariatemplates/core/DownloadMgr.js"
    };
};

var LoaderProto = Loader.prototype = {};

LoaderProto.moduleLoad = function (module) {
    return this.parentLoader.moduleLoad(module);
};

LoaderProto.downloadModule = function (params) {
    var self = this;
    var logicalPath = params.module.filename;
    // only use the download manager if it is already loaded
    var useDownloadMgr = self.getDependencyModule(self.downloadMgr).loaded;
    if (useDownloadMgr) {
        var res = promise();
        this.loadDependency(self.downloadMgr).then(function () {
            var downloadMgr = self.downloadMgr.instance;
            params.url = downloadMgr.resolveURL(logicalPath, true);
            downloadMgr.loadFile(params.module.filename, {
                scope : self,
                fn : function () {
                    var fileContent = downloadMgr.getFileContent(logicalPath);
                    if (fileContent == null) {
                        res.reject(new Error("Error while downloading " + logicalPath));
                    } else {
                        res.resolve(fileContent);
                    }
                }
            });
        });
        return res;
    } else {
        params.url = this.parentLoader.baseUrl + logicalPath;
        return request(params.url);
    }
};

// main entry point
LoaderProto.loadUnpackaged = function (module) {
    var self = this;
    var params = {
        module : module,
        extension : getExtension(module.filename)
    };
    return this.downloadModule(params).then(function (fileContent) {
        params.content = fileContent;
        params.loader = self.selectLoader(params);
        return self.loadDependency(params.loader);
    }).then(function () {
        return self.useLoader(params);
    });
};

var getExtension = function (filename) {
    var withoutPath = filename.replace(/^(.*\/)?([^/]*)$/, "$2");
    var dot = withoutPath.indexOf('.');
    if (dot > -1) {
        return withoutPath.substr(dot);
    }
    return "";
};

LoaderProto.isOldATClass = function (params) {
    var fileContent = params.content;
    var dependencies = findRequires(fileContent, true);
    if (dependencies.length == 0 && this.oldATClassRegExp.test(fileContent)) {
        return true;
    }
    params.module[oldATClassRequiresPropName] = dependencies;
    return false;
};

var firstComment = /^\s*\/\*[\s\S]*?\*\//;
var alreadyGeneratedRegExp = /^\s*Aria\.classDefinition\(/;

LoaderProto.isTemplateCompiled = function (params) {
    var fileContent = params.content;
    fileContent = fileContent.replace(firstComment, ''); // removes first comment
    return alreadyGeneratedRegExp.test(fileContent);
};

LoaderProto.selectLoader = function (params) {
    var extension = params.extension;
    if (extension === ".js") {
        if (this.isOldATClass(params)) {
            return this.oldATClassLoader;
        }
    } else if (this.templateClassLoaders.hasOwnProperty(extension)) {
        if (this.isTemplateCompiled(params)) {
            return this.oldATClassLoader;
        } else {
            return this.templateClassLoaders[extension];
        }
    }
    return this.defaultLoader;
};

LoaderProto.getDependencyModule = function (dependency) {
    if (!dependency.module) {
        var context = this.context;
        dependency.module = context.getModule(context.moduleResolve(context.rootModule, dependency.path));
    }
    return dependency.module;
};

LoaderProto.loadDependency = function (dependency) {
    if (dependency.instance) {
        // already loaded!
        return promise.done;
    }
    return this.context.moduleExecute(this.getDependencyModule(dependency)).then(function (res) {
        dependency.instance = res;
    });
};

LoaderProto.useLoader = function (params) {
    var self = this;
    var loader = params.loader.instance;
    return promise.when(loader(params.module, params.content, params.url)).then(function (res) {
        if (res === params.module) {
            // a return value containing the module object is a shortcut meaning the module was already defined directly
            // through module.exports
            res = {
                definition : promise.empty
            };
        } else {
            if (!typeUtils.isPlainObject(res)) {
                res = {
                    definition : res
                };
            }
            if (typeUtils.isString(res.definition)) {
                if (!res.dependencies) {
                    res.dependencies = findRequires(res.definition, true);
                }
                res.definition = self.context.jsModuleEval(res.definition, params.url);
            }
            if (!typeUtils.isFunction(res.definition)) {
                throw new Error("Invalid response from loader (when trying to load " + params.module.filename + ").");
            }
        }
        self.context.moduleDefine(params.module, res.dependencies || [], res.definition);
    });
};

module.exports = Loader;
