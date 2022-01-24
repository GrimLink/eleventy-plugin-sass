const path = require("path");
const pkg = require("./package.json");

module.exports = (eleventyConfig, options = {}) => {
    const {
        sass,
        outputPath = "css",
        outputStyle = "expanded",
        includePaths = ["node_modules"],
        sourceMap = false,
    } = options;
    const outputFileExtension = "css";

    try {
        eleventyConfig.versionCheck(pkg["11ty"].compatibility);
    } catch (e) {
        console.log(
            `WARN: Eleventy Plugin (${pkg.name}) Compatibility: ${e.message}`
        );
    }

    eleventyConfig.addTemplateFormats("scss");

    // Creates the extension for use
    eleventyConfig.addExtension("scss", {
        outputFileExtension,
        compileOptions: {
            permalink: (_inputContent, inputPath) => (_data) => {
                let parsed = path.parse(inputPath);
                if (parsed.name.startsWith("_")) return; // Ignore partials
                if (!outputPath) return; // default to inputPath

                return `/${outputPath}/${parsed.name}.${outputFileExtension}`;
            },
        },
        compile: (inputContent, inputPath) => {
            let parsed = path.parse(inputPath);
            if (parsed.name.startsWith("_")) return; // Ignore partials

            const loadPaths = [
                parsed.dir || ".",
                eleventyConfig.dir.includes || "_includes",
                ...includePaths,
            ];

            let result = sass.compileString(inputContent, {
                style: outputStyle,
                sourceMap,
                loadPaths,
            });

            return async (_data) => result.css;
        },
    });
};
