'use strict';

goog.provide('grrUi.hunt.huntResultsDirective');
goog.provide('grrUi.hunt.huntResultsDirective.HuntResultsDirective');

goog.require('grrUi.core.fileDownloadUtils');  // USE: downloadableVfsRoots, getPathSpecFromValue, makeValueDownloadable, pathSpecToAff4Path
goog.require('grrUi.core.utils');              // USE: stripAff4Prefix

goog.scope(function() {



/**
 * Controller for HuntResultsDirective.
 *
 * @constructor
 * @param {!angular.Scope} $scope
 * @ngInject
 */
const HuntResultsController = function(
    $scope) {
  /** @private {!angular.Scope} */
  this.scope_ = $scope;

  /** @export {string} */
  this.resultsUrl;

  /** @export {string} */
  this.exportedResultsUrl;

  /** @export {string} */
  this.outputPluginsUrl;

  /** @export {string} */
  this.downloadFilesUrl;

  /** @export {string} */
  this.exportCommandUrl;

  $scope.$watch('huntId', this.onHuntIdChange.bind(this));
};


/**
 * Handles huntId attribute changes.
 *
 * @param {?string} huntId
 * @export
 */
HuntResultsController.prototype.onHuntIdChange = function(huntId) {
  if (!angular.isString(huntId)) {
    return;
  }

  this.resultsUrl = '/hunts/' + huntId + '/results';
  this.exportedResultsUrl = '/hunts/' + huntId + '/exported-results';
  this.downloadFilesUrl = this.resultsUrl + '/files-archive';
  this.exportCommandUrl = this.resultsUrl + '/export-command';
  this.outputPluginsUrl = '/hunts/' + huntId + '/output-plugins';
};


/**
 * Transforms hunt results so that if they're pointing to files, corresponding
 * StatEntry items will be changed to __DownloadableStatEntry with a proper url
 * set.
 *
 * @param {Array<Object>} items
 * @return {Array<Object>}
 * @export
 */
HuntResultsController.prototype.transformItems = function(items) {
  var urlPrefix = '/hunts/' + this.scope_['huntId'] + '/results/clients';

  var newItems = items.map(function(item) {
    var pathSpec = grrUi.core.fileDownloadUtils.getPathSpecFromValue(item);
    if (!pathSpec) {
      return item;
    }

    var clientId = item['value']['client_id']['value'];
    var aff4Path = grrUi.core.utils.stripAff4Prefix(
        grrUi.core.fileDownloadUtils.pathSpecToAff4Path(pathSpec, clientId));

    var components = aff4Path.split('/');
    var vfsPath = components.slice(1).join('/');

    var downloadableVfsRoots =
        grrUi.core.fileDownloadUtils.downloadableVfsRoots;

    var legitimatePath = downloadableVfsRoots.some(function(vfsRoot) {
      var prefix = vfsRoot + '/';
      return vfsPath.startsWith(prefix);
    }.bind(this));

    if (!legitimatePath) {
      return item;
    }

    var downloadUrl = urlPrefix + '/' + clientId + '/vfs-blob/' + vfsPath;
    var downloadParams = {'timestamp': item['value']['timestamp']['value']};

    var downloadableItem = angular.copy(item);
    grrUi.core.fileDownloadUtils.makeValueDownloadable(
        downloadableItem, downloadUrl, downloadParams);

    return downloadableItem;
  });

  return newItems;
};


/**
 * Directive for displaying results of a hunt with a given ID.
 *
 * @return {!angular.Directive} Directive definition object.
 * @ngInject
 * @export
 */
grrUi.hunt.huntResultsDirective.HuntResultsDirective = function() {
  return {
    scope: {
      huntId: '='
    },
    restrict: 'E',
    templateUrl: '/static/angular-components/hunt/hunt-results.html',
    controller: HuntResultsController,
    controllerAs: 'controller'
  };
};


/**
 * Directive's name in Angular.
 *
 * @const
 * @export
 */
grrUi.hunt.huntResultsDirective.HuntResultsDirective.directive_name =
    'grrHuntResults';

});  // goog.scope
