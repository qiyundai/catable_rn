module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Transform import.meta for compatibility with environments that don't support it
      function () {
        return {
          visitor: {
            MetaProperty(path) {
              // Replace import.meta with a compatible alternative
              if (
                path.node.meta.name === 'import' &&
                path.node.property.name === 'meta'
              ) {
                // Replace import.meta.url with a placeholder
                if (
                  path.parent.type === 'MemberExpression' &&
                  path.parent.property.name === 'url'
                ) {
                  path.parentPath.replaceWithSourceString(
                    'typeof document !== "undefined" ? document.currentScript?.src || window.location.href : "file://"'
                  );
                } else {
                  // Replace import.meta with empty object for other uses
                  path.replaceWithSourceString('({})');
                }
              }
            },
          },
        };
      },
    ],
  };
};

