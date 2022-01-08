// the directive module should be applied last, after all
// built-in modules have been applied.



var baseModules = [
    ref,
    directives
];
var modules = platformModules.concat(baseModules);

var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });