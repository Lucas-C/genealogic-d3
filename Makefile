# BEWARE ! Makefiles require the use of hard tabs

ifndef genealogy
    $(error genealogy is undefined)
endif

INPUT_IMG_DIR=miniatures_$(genealogy)/

BIRTHDAY_CALENDAR_CSS=birthday-calendar-$(genealogy).css
OUT_CSS_BUNDLE=bundle-$(genealogy).css
OUT_JS_BUNDLE=bundle-$(genealogy).js
OUT_HTML=$(genealogy)_family.html

CSS_DEPS =  node_modules/flex-calendar/dist/flex-calendar.min.css
JS_DEPS =   node_modules/angular/angular.min.js\
            node_modules/angular-translate/dist/angular-translate.min.js\
            node_modules/d3/d3.min.js\
            node_modules/flex-calendar/dist/flex-calendar.min.js\
            node_modules/moment/min/moment.min.js\
            node_modules/moment-ferie-fr/moment-ferie-fr.min.js

SRC_DIR	    := src/
CSS_SRCS    := $(wildcard $(SRC_DIR)*.css)
JS_SRCS     := $(wildcard $(SRC_DIR)*.js)

.PHONY: install check

all: $(OUT_CSS_BUNDLE) $(OUT_JS_BUNDLE) $(OUT_HTML)
	@:

$(OUT_HTML): family_template.html
	sed -e "s/{{genealogy_name}}/$(genealogy)/g" $< > $@

$(OUT_CSS_BUNDLE): $(CSS_DEPS) $(CSS_SRCS) $(BIRTHDAY_CALENDAR_CSS)
	cat >$@ $^

$(OUT_JS_BUNDLE): $(JS_DEPS) $(JS_SRCS)
	cat >$@ $^

$(BIRTHDAY_CALENDAR_CSS): $(genealogy)_genealogy.json
	./generate-genealogy-css.sh $(genealogy)

check: $(CSS_SRCS) $(JS_SRCS)
	csslint $(CSS_SRCS)
	jshint $(JS_SRCS)
	jscs $(JS_SRCS)

install: package.json
	npm install
