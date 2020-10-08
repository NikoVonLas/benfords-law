const mix = require('laravel-mix');

mix.options({ processCssUrls: false });
mix.js('src/js/app.js', 'js')
   .sass('src/sass/app.scss', 'css')
   .copy('src/lang', 'public/lang')
   .setPublicPath('public');
