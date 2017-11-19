module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	nggettext_extract: {
		pot: {
	      files: {
	        'po/template.pot': ['app/*.html', 'app/partials/*.html', 'app/partials/**/*.html', 'app/js/angular/**/*.js']
	      }
	    },
	},

	nggettext_compile: {
		all: {
		    options: {
		      module: 'translateApp'
		    },
		  files: {
		    'app/js/translate/translations.js': ['po/*.po']
		  }
	   },
  },

  jsdoc: {
		dist: {
	      src: ['./dist/components/*.js'],
	      options: {
	        destination: './docs',
	        configure: 'node_modules/angular-jsdoc/common/conf.json',
	        template: 'node_modules/angular-jsdoc/angular-template',
	        tutorial: 'tutorials',
	        readme: './README.md'
	      }
	    }
	},

  apidoc: {
		myapp: {
		    src: "./app/js/apidoc/",
		    dest: "./build/apidoc/",
        options: {
          debug: true,
          includeFilters: [ ".*\\.js$" ],
          excludeFilters: [ "node_modules/" ]
        }
		}
	},

  ngAnnotate: {
    options: {
        singleQuotes: true
    },
    app: {
        files: {
			// filters
            './dist/components/filters.js': [
				'./dev/novice/lib/filters/filters.js',
				'./dev/novice/lib/filters/timeFormat.js'
			],
			// services
			'./dist/components/services.js': [
				'./dev/novice/lib/services/services.js',
				'./dev/novice/lib/services/noviceUtils.js'
			],
			// router
            './dist/components/router.js': [
              './dev/novice/lib/router/router.js',
              './dev/novice/lib/router/services.js',
              './dev/novice/lib/router/ResolveProvider.js',
			  './dev/novice/lib/router/noviceRouterService.js',
			  './dev/novice/lib/router/config.js',
			  './dev/novice/lib/router/run.js'
            ],
			// noviceApp
			'./dist/components/noviceApp.js': [
				'./dev/novice/lib/noviceApp.js'
			],
        }
    }
  },

  concat: {
	noviceAngular: {
        src: ['./dist/components/*.js'],
        dest: './dist/novice-angular.js'
    }
  },

  uglify: {
	// filters
    filters: {
        src: ['./dist/components/filters.js'],
        dest: './dist/components/filters.min.js'
    },
	// services
    services: { //target
        src: ['./dist/components/services.js'],
        dest: './dist/components/services.min.js'
    },
	// router
	router: { //target
        src: ['./dist/components/router.js'],
        dest: './dist/components/router.min.js'
    },
	// noviceApp
	noviceApp: { //target
        src: ['./dist/components/noviceApp.js'],
        dest: './dist/components/noviceApp.min.js'
    },
	// novice-angular
	noviceAngular: { //target
        src: ['./dist/novice-angular.js'],
        dest: './dist/novice-angular.min.js'
    }
  }

  });

  // Load the plugin that provides "nggettext_extract" and "nggettext_compile" tasks.
  grunt.loadNpmTasks('grunt-angular-gettext');

  // Load the plugin that provides the "jsdoc" task.
  grunt.loadNpmTasks('grunt-jsdoc');

  // Load the plugin that provides the "apidoc" task.
  grunt.loadNpmTasks('grunt-apidoc');

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ng-annotate');

  // Default task(s).
  grunt.registerTask('default', ['nggettext_extract']);

  grunt.registerTask('min_angular', ['ngAnnotate', 'concat', 'uglify']);

  grunt.registerTask('build', [
	  'nggettext_extract',
	  'nggettext_compile'
  ]);

  grunt.registerTask('pot', [
	  'nggettext_extract'
  ]);

  grunt.registerTask('potojs', [
	  'nggettext_compile'
  ]);

  grunt.registerTask('docs', [
	  'jsdoc'
  ]);

};