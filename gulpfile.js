let project_folder = require("path").basename(__dirname); // Сюда выгружается конечный результат
let source_folder  = "#src"; // Чтобы не менять по все коду имя папки, можно заменить его только тут

let fs = require('fs');

//Куда будет выгружать gulp обработанные файлы
let path = {
    //Готовые файлы
    build: {
        html: project_folder  + "/",
        css: project_folder   + "/css/",
        js: project_folder    + "/js/",
        img: project_folder   + "/img/",
        fonts: project_folder + "/fonts/",
    },
    // Файлы исходника
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], //Второе, чтобы не создавался лиший html файл
        css: source_folder   + "/scss/style.scss",
        js: source_folder    + "/js/main.js",
        img: source_folder   + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    // Постоянное наблюдение за этими файлами
    watch: {
        html: source_folder  + "/**/*.html",
        css: source_folder   + "/scss/**/*.scss",
        js: source_folder    + "/js/**/*.js",
        img: source_folder   + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    // Для очитски
    clean: "./" + project_folder + "/"
}

//Все плагины
let {src, dest}  = require('gulp'),
    gulp         = require('gulp'),
    browsersync  = require('browser-sync').create(),
    fileinclude  = require('gulp-file-include'), //Для удобного подключения файлов
    del          = require('del'), // Для очистки
    scss         = require('gulp-sass'), 
    autoprefixer = require('gulp-autoprefixer'),
    group_media  = require('gulp-group-css-media-queries')
    clean_css    = require('gulp-clean-css'),
    rename_files = require('gulp-rename'),
	uglify       = require('gulp-uglify-es').default,
	imageMin     = require('gulp-imagemin'),
	webp         = require('gulp-webp'),
	webphtml     = require('gulp-webp-html'),
	webpCss      = require('gulp-webp-css'),
	svg_Sprite   = require('gulp-svg-sprite'),
	ttf2woff     = require('gulp-ttf2woff'),
	ttf2woff2    = require('gulp-ttf2woff2'),
	fonter       = require('gulp-fonter');

function browserSync(params) {
    browsersync.init({
        server:{
            baseDir: "./" + project_folder + "/" //Базовое значение папки
        },
        port:3000, //Порт по которому будет открываться файл
        notify: false //Убираем уведомления плагина
    })
}

//HTML
function html() {
    return src(path.src.html) //Путь к html файлу в сорсу
		.pipe(fileinclude())
		.pipe(webphtml()) // Работа с новыми форматами
        .pipe(dest(path.build.html)) //Выгружаем
        .pipe(browsersync.stream()) //Обновление страницы
}


// CSS
function css() {
    return src(path.src.css) //Путь к css файлу в сорсу
        .pipe(
            scss({
                outputStyle: "expanded"
            })
        )
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            })
		)
		.pipe(webpCss()) // Работа с новыми форматами
        .pipe(dest(path.build.css)) //Выгружаем
        .pipe(clean_css()) //Очишаем
        .pipe( //Создаем мин версию
            rename_files({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css)) //Выгружаем мин версию
        .pipe(browsersync.stream()) //Обновление страницы

}

// JS
function js() {
    return src(path.src.js) //Путь к js файлу в сорсу
        .pipe(fileinclude())
        .pipe(dest(path.build.js)) //Выгружаем
        .pipe(
            uglify()
        )
        .pipe(
            rename_files({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js)) //Выгружаем мин версию
        .pipe(browsersync.stream()) //Обновление страницы
}

// IMAGES
function images() {
    return src(path.src.img) //Путь к img файлу в сорсу
		.pipe(
			webp({
				quality: 70
			})
		)
		.pipe(dest(path.build.img)) //Выгружаем	
		.pipe(src(path.src.img))
		.pipe(
			imageMin({
				progressive: true,
				svgPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.img)) //Выгружаем
        .pipe(browsersync.stream()) //Обновление страницы
}

// FONTS
function fonts() {
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts));
};

gulp.task('otf2ttf', function () {
	return src([source_folder + '/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(source_folder + '/fonts/'));
})

// SVG
gulp.task('svg_Sprite', function () {
	return gulp.src([source_folder + '/iconsprite/*.svg'])
		.pipe(svg_Sprite({
			mode: {
				stack: {
					sprite: "../icon/icons.svg",
					example: true
				}
			},
		}
		))
		.pipe(dest(path.build.img)) // Выгружаем
})

function fontsStyle(params) {
	let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
	if (file_content == '') {
		fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
}

function cb() {}

// Слежка за файлами
function watchFiles(params) {
    gulp.watch([path.watch.html], html); // Следим за файлами html
    gulp.watch([path.watch.css], css); // Следим за файлами css
	gulp.watch([path.watch.js], js); // Следим за файлами js
	gulp.watch([path.watch.img], images); // Следим за файлами img
}

// Для очистки ненужного файла html из dist
function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync); //Сценарий Для параллельного выполнения

//Выполение
exports.fontsStyle = fontsStyle;
exports.fonts      = fonts;
exports.images     = images;
exports.js         = js;
exports.css        = css;
exports.html       = html;
exports.build      = build;
exports.watch      = watch;
exports.default    = watch;
