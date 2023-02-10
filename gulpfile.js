import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import rename from 'gulp-rename';
import browser from 'browser-sync';
import clean from 'gulp-clean';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import imagemin from 'gulp-imagemin';
import uglify from 'gulp-uglify';

//HTML

const html = () => {
    return gulp.src('source/*.html')
        .pipe(gulp.dest('build'))
}

//Styles

export const styles = () => {
    return gulp.src('source/sass/style.scss', {sourcemaps: true})
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            autoprefixer(),
            csso()
        ]))
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest('build/css', {sourcemaps: '.'}))
        .pipe(browser.stream());
}

//Scripts
const scripts = () => {
    return gulp.src('source/js/app.js')
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
}

//Images
const optimizeImages = () => {
    return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(imagemin())
    .pipe(gulp.dest('build/img'))
}

//Svg
const svg = () => 
    gulp.src('source/img/**/*.svg')
    .pipe(svgo())
    .pipe(gulp.dest('build/img/icon'))

//Sprite
const sprite = () => {
    return gulp.src('source/img/icon/*.svg')
        .pipe(svgo())
        .pipe(svgstore({
             inlineSvg: true
         }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}


//Copy
const copy = (done) => {
    gulp.src([
        'source/fonts/*.{woff2,woff}',
        'source/*.ico'
    ], {base: 'source'})
    .pipe(gulp.dest('build'))
    done();
}

//Copy Images
const copyImages = () => {
    return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(gulp.dest('build/img'))
}

//Clean
const clear = () => {
    return gulp.src('build', {allowEmpty: true})
        .pipe(clean());
}

//Server
const server = (done) => {
    browser.init({
        server: {
            baseDir: 'build'
        },
        cors: true,
        notify: false,
        ui: false,
    });
    done();
}

//Reload
const reload = (done) => {
    browser.reload();
    done();
}

//Watcher
const watcher = () => {
    gulp.watch('source/sass/**/*.scss', gulp.series(styles));    
    gulp.watch('source/js/app.js', gulp.series(scripts))
    gulp.watch('source/*.html', gulp.series(html, reload));
}

//Build
export const build = gulp.series (
    clear,
    copy,
    optimizeImages,
    gulp.parallel(
        styles,
        html,
        scripts,
        svg,
        sprite
    ),
    
);

//Default
export default gulp.series(
    clear,
    copy,
    copyImages,
    gulp.parallel(
        styles,
        html,
        scripts,
        svg,
        sprite
    ),
    gulp.series (
        server,
        watcher
    )
);