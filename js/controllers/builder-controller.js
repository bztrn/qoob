var BuilderController = Backbone.Router.extend({
    routes: {
        "index": "index",
        "groups/:group": "showGroup", // #groups/name
        "edit/:blockId": "startEditBlock", // #groups/name
    },
    index: function () {
        this.layout.menu.showIndex();
        this.layout.toolbar.logoRotation('side-0');
    },
    showGroup: function (group) {
        this.layout.menu.showGroup(group);
        this.layout.toolbar.logoRotation('side-90');
    },
    setLayout: function (layout) {
        this.layout = layout;
    },
    setPageModel: function (model) {
        this.pageModel = model;
    },
    setStorage: function (storage) {
        this.storage = storage;
    },
    setPreviewMode: function () {
        this.layout.setPreviewMode();
    },
    setEditMode: function () {
        this.layout.setEditMode();
    },
    setDeviceMode: function (mode) {
        this.layout.setDeviceMode(mode);
    },
    /**
     * Autosave page data for interval
     * @param {Boolean} autosave
     */
    setAutoSave: function (autosave) {
        this.autosave = autosave;

        var self = this;
        if (this.autosave) {
            var intervalId = setInterval(function () {
                if (this.autosave) {
                    self.save();
                } else {
                    clearInterval(intervalId);
                }
            }, 60000);
        }
    },
    /**
     * Save page data
     * @param {createBlockCallback} cb - A callback to run.
     */
    save: function (cb) {
        var self = this;
        
        // show clock autosave
        this.layout.toolbar.showAutosave();
        
        var json = JSON.parse(JSON.stringify(this.pageModel.toJSON()));
        var html = '';
        var blocks = this.pageModel.get('blocks').models;
        for (var i = 0; i < blocks.length; i++) {
            var blockModel = blocks[i];
            var blockView = this.storage.getBlockView(blockModel.id); //new BlockView({model:blockModel, storage: this.storage});
            html += blockView.html;
        }
        ;
        this.storage.save(json, html, function (err, status) {
            // hide clock autosave
            self.layout.toolbar.hideAutosave();            
            // Make sure the callback is a function​
            if (typeof cb === "function") {
                // Call it, since we have confirmed it is callable​
                cb(err, status);
            }
        });
    },
    /**
     * Out of the Builder
     */
    exit: function () {
        var self = this;
        if (this.autosave) {
            this.save(function (err, status) {
                if (status) {
                    self.storage.driver.exit(self.storage.pageId);
                }
            });
        } else {
            this.storage.driver.exit(this.storage.pageId);
        }
    },
    addNewBlock: function (templateId, afterId) {
        this.addBlock(BuilderUtils.getDefaultSettings(this.storage.builderData.items, templateId), afterId);
    },
    addBlock: function (values, afterId) {
        var model = BuilderUtils.createModel(values);
        this.pageModel.addBlock(model, afterId);
    },
    startEditBlock: function (blockId) {
        this.layout.startEditBlock(blockId);
    },
    stopEditBlock: function () {
        this.layout.stopEditBlock();
        this.navigate('index', {trigger: true});
    },
    load: function (blocks) {
        this.pageModel.load(blocks);
    },
    setInnerSettingsView: function (view) {
        //Add view to the cube side
        this.layout.menu.addView(view, 270);
        //Rotate to this side
        this.layout.menu.rotate(view.$el.prop('id'));
        //Store view
        this.layout.menu.settingsViewStorage = this.layout.menu.settingsViewStorage || [];
        this.layout.menu.settingsViewStorage[view.$el.prop('id')] = view;

    }
});
