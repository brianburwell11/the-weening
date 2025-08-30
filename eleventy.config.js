module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy("src/assets");
    return {
        dir: {
            input: "src",
            output: "_static"
        },
        templateFormats: ["liquid", "md", "html"],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid"
    };
};