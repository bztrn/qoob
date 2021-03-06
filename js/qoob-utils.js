/**
 * Utils for qoob
 *
 * @version 0.0.1
 * @class  QoobUtils
 */
var QoobUtils = {
    /**
     * Find items for params
     * @param {Array} data
     * @param {Object} args filter params
     * @returns {Object}
     */
    findItems: function(data, args) {
        var result;
        return result;
    },
    /**
     * Create Backbone.Model for settings
     *
     * @param {Object} settings
     * @returns {Backbone.Model|QoobUtils.prototype.createModel.model}
     */
    createModel: function(settings) {
        settings.id = parseInt(_.uniqueId());
        var model = new BlockModel();

        var newSettings = {};
        for (var i in settings) {
            if (_.isArray(settings[i])) {
                newSettings[i] = this.createCollection(settings[i]);
                model.listenTo(newSettings[i], "change", function() {
                    this.trigger('change', this);
                });

                newSettings[i].forEach(function(model, index) {
                    model.owner_id = settings.id;
                });
            } else {
                newSettings[i] = settings[i];
            }
            model.set(i, newSettings[i]);
        }

        return model;
    },
    /**
     * Create collection when nested field is array
     *
     * @param {Object} settings
     * @returns {QoobUtils.prototype.createCollection.collection|Backbone.Collection}
     */
    createCollection: function(settings) {
        var collection = new Backbone.Collection();

        for (var i = 0; i < settings.length; i++) {
            var model = this.createModel(settings[i]);
            collection.add(model);
            collection.listenTo(model, 'change', function() {
                this.trigger('change', this);
            });
        }
        return collection;
    },
    /**
     * Get default settings
     *
     * @param {integer} templateId
     */
    getDefaultSettings: function(items, templateId) {
        // get config from storage qoobData
        //qoob.storage.qoobData.items
        var values = {};
        var settings = _.findWhere(items, { id: templateId }).settings;
        var defaults = (_.findWhere(items, { id: templateId }).defaults);
        for (var i = 0; i < settings.length; i++) {
            values[settings[i].name] = defaults[settings[i].name];
        }
        values.template = templateId;

        return values;
    }
};
