# BEWARE ! Makefiles require the use of hard tabs

ifndef GENEALOGY
    $(error GENEALOGY is undefined)
endif

INPUT_IMG_DIR=miniatures_$(GENEALOGY)/

BIRTHDAY_CALENDAR_CSS=birthday-calendar-$(GENEALOGY).css
OUT_CSS_BUNDLE=bundle-$(GENEALOGY).css
OUT_JS_BUNDLE=bundle-$(GENEALOGY).js
OUT_HTML=$(GENEALOGY)_family.html

CSS_DEPS =  bower_components/flex-calendar/dist/flex-calendar.min.css
JS_DEPS =   bower_components/angular/angular.min.js\
            bower_components/angular-translate/angular-translate.min.js\
            bower_components/d3/d3.min.js\
            bower_components/flex-calendar/dist/flex-calendar.min.js\
            bower_components/moment/min/moment.min.js\
            bower_components/moment-ferie-fr/moment-ferie-fr.min.js

SRC_DIR	    := src/
CSS_SRCS    := $(wildcard $(SRC_DIR)*.css)
JS_SRCS     := $(wildcard $(SRC_DIR)*.js)

.PHONY: install check check-css check-js pkg-upgrade-checker help

all: $(OUT_CSS_BUNDLE) $(OUT_JS_BUNDLE) $(OUT_HTML)
	@:

$(OUT_HTML): family_template.html
	sed -e "s/{{geneaolgy_name}}/$(GENEALOGY)/g" $< > $@

$(OUT_CSS_BUNDLE): $(CSS_DEPS) $(CSS_SRCS) $(BIRTHDAY_CALENDAR_CSS)
	cat >$@ $^

$(OUT_JS_BUNDLE): $(JS_DEPS) $(JS_SRCS)
	cat >$@ $^

$(BIRTHDAY_CALENDAR_CSS): $(INPUT_IMG_DIR)
	./generate-genealogy-css.sh $< $@

check: check-css check-js
	@:

check_css: $(CSS_SRCS)
	csslint $^

check-js: $(JS_SRCS)
	jshint $^
	jscs $^

install: bower.json
	bower install

pkg-upgrade-checker:
	bower list

help:
	# make -n target           # --dry-run : get targets description
	# make -B target           # --always-make : force execution of targets commands, even if dependencies are satisfied
	# make GENEALOGY=...       # variable override
	# make --debug[=abijmv]    # enable variants of make verbose output
