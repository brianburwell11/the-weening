module.exports = function (eleventyConfig) {
    const { parse } = require('csv-parse/sync');

    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("_redirects");
    eleventyConfig.addPassthroughCopy("public");
    eleventyConfig.setDataDeepMerge(true);
    eleventyConfig.addDataExtension("csv", (contents) => {
        const records = parse(contents, {
            columns: true,
            skip_empty_lines: true,
        });
        return records;
    });

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