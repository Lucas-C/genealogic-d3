
birthday_calendar = (function () {
    'use strict';
    function traverseGenealogy(genealogy, callback) {
        callback(genealogy);
        if (genealogy.partner) {
            callback(genealogy.partner);
        }
        if (genealogy.children) {
            genealogy.children.forEach(function (child) {
                traverseGenealogy(child, callback);
            });
        }
    }
    function generateEvents (genealogy, years) {
        var events = [],
            peoplePerBirthdate = {};
        traverseGenealogy(genealogy, function (people) {
            if (people.birthdate) {
                years.forEach(function (year) {
                    var birthdate = year + people.birthdate.slice(4);
                    events.push({date: birthdate, node_name: people.name, name: people.name.replace(/\d/g, '')});
                    if (!peoplePerBirthdate[birthdate]) {
                        peoplePerBirthdate[birthdate] = [];
                    }
                    peoplePerBirthdate[birthdate].push(people.name);
                });
            }
        });
        events.forEach(function (event) {
            if (peoplePerBirthdate[event.date].length > 1) {
                event.eventClass = 'birthdays-' + peoplePerBirthdate[event.date].length;
            } else {
                event.eventClass = 'birthday-' + event.node_name.replace(/ /g, '');
            }
        });
        return events;
    }
    return function (json_genealogy) {
        angular.module('BirthdayCalendar', ['flexcalendar', 'pascalprecht.translate'])
            .config(function ($translateProvider) {
                 $translateProvider.translations('fr', {
                     JANUARY: 'Janvier',
                     FEBRUARY: 'Février',
                     MARCH: 'Mars',
                     APRIL: 'Avril',
                     MAI: 'Mai',
                     JUNE: 'Juin',
                     JULY: 'Juillet',
                     AUGUST: 'Août',
                     SEPTEMBER: 'Septembre',
                     OCTOBER: 'Octobre',
                     NOVEMBER: 'Novembre',
                     DECEMBER: 'Décembre',

                     SUNDAY: 'Dimanche',
                     MONDAY: 'Lundi',
                     TUESDAY: 'Mardi',
                     WEDNESDAY: 'Mercredi',
                     THURSDAY: 'Jeudi',
                     FRIDAY: 'Vendredi',
                     SATURDAY: 'Samedi'
                });
                $translateProvider.preferredLanguage('fr');
                $translateProvider.useSanitizeValueStrategy(null);
            })
            .run(function($http, $rootScope) {
                $http.get(json_genealogy).then(function (response) {
                    var genealogy = response.data,
                        bankHolidays = moment().getFerieList(2016).map(function (d) { return d.date.format('YYYY-MM-DD'); }),
                        years = [moment().subtract(1, 'y').format('YYYY'), moment().format('YYYY'), moment().add(1, 'y').format('YYYY')],
                        events = generateEvents(genealogy, years);
                    $rootScope.options = {
                        changeMonth: function () {},
                        dateClick: function (date, event) {
                            if (date.event.length < 2) {
                                return;
                            }
                            if (date.index === undefined) {
                                date.index = 0;
                            } else {
                                date.index = (date.index + 1) % (date.event.length + 1);
                            }
                            var prevIndex = (date.index + date.event.length) % (date.event.length + 1);
                            if (prevIndex !== date.event.length) {
                                var prevClass = 'birthday-' + date.event[prevIndex].node_name.replace(/ /g, '');
                                event.currentTarget.classList.remove(prevClass);
                            }
                            if (date.index < date.event.length) {
                                var newClass = 'birthday-' + date.event[date.index].node_name.replace(/ /g, '');
                                event.currentTarget.classList.add(newClass);
                            }
                        },
                        disabledDates: bankHolidays,
                        mondayIsFirstDay: true
                    };
                    $rootScope.events = events;
                });
            });
    };
})();
