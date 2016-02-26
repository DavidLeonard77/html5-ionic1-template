'use strict';

/**
 * @ngdoc function
 * @name Html5IonicTemplate.service:AccountService
 * @description Helper functions for user accounts
 * # AccountService
 */
module.exports = [
    '$q',
    'UserService',

    function(
      $q,
      UserService
    ) {

      function getToday() {
        var today = new Date(),
          dd = today.getDate(),
          mm = today.getMonth() + 1,
          yyyy = today.getFullYear();

        if (dd < 10) {
          dd = '0' + dd;
        }
        if (mm < 10) {
          mm = '0' + mm;
        }

        return mm + '/' + dd + '/' + yyyy;
      }

      var _questions = [
        'Clinical Practice (Stage 1-5)',
        'Average Selling Price (ASP)',
        'Prior Year 3M Sales',
        'Competition',
        'Notes'
      ];

      var _patientwarming = {
        prerequisites: [{
          name: 'specialtyprocedures',
          title: 'What % of surgical procedures are Specialty (Cardio+Ortho)?'
        }],
        products: [{
          name: 'warmingstandard',
          title: 'Warming Blankets and Gowns - Standard'
        },{
          name: 'warmingspecialty',
          title: 'Warming Blankets and Gowns - Specialty'
        },{
          name: 'fluidwarming',
          title: 'Fluid Warming Disposables'
        },{
          name: 'spotondisposables',
          title: 'Spoton Disposables'
        }],
        practicestage: '',
        sellingprice: '',
        priorsales: '',
        competition: '',
        notes: ''
      };

      var _perioperative = {
        prerequisites: [{
          name: 'highrisk',
          title: 'What % of surgeries are High Risk?'
        },{
          name: 'mediumrisk',
          title: 'What % of surgeries are Medium Risk?'
        }],
        products: [{
          name: 'clipperblades',
          title: 'Clipper Blades'
        },{
          name: 'skinprep',
          title: 'Skin Prep Single Dose Sterile Application'
        },{
          name: 'draping',
          title: 'Draping'
        },{
          name: 'drapeshighrisk',
          title: 'Incise Drapes - High Risk'
        },{
          name: 'drapesmediumrisk',
          title: 'Incise Drapes - Medium Risk'
        },{
          name: 'avgchp',
          title: 'Average CHG'
        }],
        practicestage: '',
        sellingprice: '',
        priorsales: '',
        competition: '',
        notes: ''
      };

      var _sterilizationsteam = {
        prerequisites: [{
          name: 'loadspersterilizer',
          title: 'Loads per sterilizer per day?'
        },{
          name: 'packsperload',
          title: 'Packs per load?'
        },{
          name: 'perhospital',
          title: 'Sterilizers per hospital?'
        },{
          name: 'lengthoftape',
          title: 'Length of tape per pack (in cms)'
        }],
        products: [{
          name: 'bioindicator',
          title: 'Biological Indicator'
        },{
          name: 'chemindicator',
          title: 'Chemical Indicator'
        },{
          name: 'bowiedick',
          title: 'Bowie dick including ETS'
        },{
          name: 'indicatortape',
          title: 'Indicator tape'
        },{
          name: 'cleantracehardware',
          title: 'Clean-trace hardware'
        },{
          name: 'cleantraceswabs',
          title: 'Clinical clean-trace swabs'
        }],
        practicestage: '',
        sellingprice: '',
        priorsales: '',
        competition: '',
        notes: ''
      };

      var _sterilizationperoxide = {
        prerequisites: [{
          name: 'loadspersterilizer',
          title: 'Loads per sterilizer per day?'
        },{
          name: 'packsperload',
          title: 'Packs per load?'
        },{
          name: 'perhospital',
          title: 'Sterilizers per hospital?'
        },{
          name: 'lengthoftape',
          title: 'Length of tape per pack (in cms)'
        }],
        products: [{
          name: 'bioindicator',
          title: 'Biological Indicator'
        },{
          name: 'chemindicator',
          title: 'Chemical Indicator'
        },{
          name: 'bowiedick',
          title: 'Bowie dick including ETS'
        },{
          name: 'indicatortape',
          title: 'Indicator tape'
        },{
          name: 'cleantracehardware',
          title: 'Clean-trace hardware'
        },{
          name: 'cleantraceswabs',
          title: 'Clinical clean-trace swabs'
        }],
        practicestage: '',
        sellingprice: '',
        priorsales: '',
        competition: '',
        notes: ''
      };

      function _addCover (src) {
        var cover = {};
        angular.forEach(src.prerequisites, function(prerequisite){
          cover[prerequisite.name] = '';
        });
        cover.prerequisites = src.prerequisites;
        return cover;
      }

      function _addProduct (src) {
        var _products = [];
        angular.forEach(src.products, function(product){
          _products.push({
            name: product.name,
            title: product.title,
            practicestage: src.practicestage,
            sellingprice: src.sellingprice,
            priorsales: src.priorsales,
            competition: src.competition,
            notes: src.notes
          });
        });
        return _products;
      }

      var _account = {
        rep: 'Some Rep Guy',
        country: 'USA',
        date: getToday(),
        id: 215513,
        name: 'Joe\'s crab house',
        surgeries: 22,
        hospitals: 43,
        opportunity: 'perioperative',
        businesses: {
          patientwarming: {
            name: 'patientwarming',
            title: 'PATIENT WARMING QUESTION',
            cover: _addCover(_patientwarming),
            products: _addProduct(_patientwarming),
            questions: _questions
          },
          perioperative: {
            name: 'perioperative',
            title: 'PERIOPERATIVE QUESTION',
            cover: _addCover(_perioperative),
            products: _addProduct(_perioperative),
            questions: _questions
          },
          sterilizationsteam: {
            name: 'sterilizationsteam',
            title: 'STERILIZATION - STEAM QUESTION',
            cover: _addCover(_sterilizationsteam),
            products: _addProduct(_sterilizationsteam),
            questions: _questions
          },
          sterilizationperoxide: {
            name: 'sterilizationperoxide',
            title: 'STERILIZATION - HYDROGEN PEROXIDE QUESTION',
            cover: _addCover(_sterilizationperoxide),
            products: _addProduct(_sterilizationperoxide),
            questions: _questions
          }
        }
      };

      function createAccount() {
        return _account;
      }

      function getAccount(index) {
        return $q(function(resolve){
          UserService.findById(0).then(function(user){
            resolve(user.accounts[index]);
          });
        });
      }

      // public api
      return {
        createAccount: createAccount,
        getAccount: getAccount
      };
    }
];
