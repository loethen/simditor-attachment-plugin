(function() {
  var AttachmentButton,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  AttachmentButton = (function(_super) {
    __extends(AttachmentButton, _super);

    function AttachmentButton() {
      this.preview = __bind(this.preview, this);
      return AttachmentButton.__super__.constructor.apply(this, arguments);
    }

    AttachmentButton.prototype.name = 'attachment';

    AttachmentButton.prototype.icon = 'paperclip';

    AttachmentButton.prototype.title = '图片附件';

    AttachmentButton.prototype._tpl = {
      item: '<li><a tabindex="-1" unselectable="on" class="toolbar-item" href="javascript:;"><span></span><input id="upload_file" type="file" name="upload_file" tabindex="-1" multiple="true" accept="image/*"></a></li>',
      attachments: '<div class="simditor-attachments"></div>',
      thumbnails: '<div class="simditor-thumbnails"></div>',
      attachment: "<div class=\"attachment\">\n  <div class=\"thumb-wrap\">\n    <img src=\"\" class=\"\" data-image-src=\"\" data-image-size=\"\" data-image-name=\"\" style=\"cursor: pointer;\">\n  </div>\n  <span class=\"name\"></span>\n  <span class=\"size\"></span>\n  <div class=\"progress\">\n    <div class=\"progress-bar progress-bar-info progress-bar-striped\"  role=\"progressbar\" aria-valuenow=\"0\" aria-valuemin=\"0\" aria-valuemax=\"100\">\n    </div>\n  </div>\n  <a href=\"javascript:;\" class=\"link-cancel\" title=\"移除附件\"><span class=\"glyphicon glyphicon-remove-circle\"></span></a>\n</div>"
    };

    AttachmentButton.prototype.command = function(param) {
      var filesinput, img_arr;
      filesinput = this.el.find("#upload_file");
      filesinput.click(function(e) {
        return e.stopPropagation();
      });
      img_arr = this.img_arr;
      this.attachments.on('click', '.link-cancel', function(event) {
        var id, parent;
        parent = $(this).parent();
        id = parent.attr('id');
        id = id.slice(1);
        img_arr.splice($.inArray(id, img_arr), 1);
        return parent.remove();
      });
      return filesinput.change((function(_this) {
        return function(event) {
          var arr, file, that, _i, _len, _ref;
          arr = [];
          that = event.target;
          _ref = that.files;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            file = _ref[_i];
            _this.preview(file, arr, img_arr);
          }
          _this.editor.uploader.upload(arr, _this.editor.opts.url);
          return $(that).val('');
        };
      })(this));
    };

    AttachmentButton.prototype.preview = function(file, arr, img_arr) {
      var attachid, _ref;
      attachid = md5(file.name);
      if (_ref = md5(file.name), __indexOf.call(img_arr, _ref) >= 0) {
        return false;
      } else {
        if (__indexOf.call(img_arr, attachid) < 0) {
          img_arr.push(attachid);
        }
        arr.push(file);
        return this.editor.uploader.readImageFile(file, (function(_this) {
          return function(img) {
            var attach;
            attach = $(_this._tpl.attachment).appendTo(_this.attachments);
            attach.find('img').attr({
              'src': img.src,
              'data-image-name': file.name
            });
            attach.find('.name').text(file.name);
            attach.find('.size').text(Math.floor(file.size / 1024) + 'k');
            return attach.attr('id', '_' + attachid);
          };
        })(this));
      }
    };

    AttachmentButton.prototype._initUploader = function() {
      this.editor.uploader.on('uploadprogress', (function(_this) {
        return function(e, file, loaded, total) {
          var attach, attachid, percent;
          percent = loaded / total;
          percent = (percent * 100).toFixed(0);
          if (percent > 99) {
            percent = 99;
          }
          attachid = md5(file.name);
          attach = $("#_" + attachid);
          return attach.find('.progress-bar').css('width', percent + '%').attr('aria-valuenow', percent);
        };
      })(this));
      return this.editor.uploader.on('uploadsuccess', (function(_this) {
        return function(e, file, result) {
          var attach, attachid, img, msg, _ref;
          if (result.success === false) {
            msg = result.msg || '上传被拒绝了';
            return alert(msg);
          } else {
            attachid = md5(file.name);
            attach = $("#_" + attachid);
            if ((_this.thumbarr != null) && (_ref = result.file_path, __indexOf.call(_this.thumbarr, _ref) >= 0)) {
              attach.fadeOut(300);
              return;
            }
            img = new Image();
            img.onload = function() {
              $('<img>', {
                "title": "点击图片插入编辑器",
                "alt": attachid,
                "src": result.file_path
              });
              attach.find('.thumb-wrap').html(img);
              return attach.find('.progress').hide();
            };
            img.onerror = function() {
              return alert('图片可能出错了,请重新上传');
            };
            return img.src = result.file_path;
          }
        };
      })(this));
    };

    AttachmentButton.prototype._initDrag = function() {
      this.editor.el[0].ondragover = function(e) {
        e.preventDefault();
        return $(this).addClass('hover');
      };
      this.editor.el[0].ondragleave = function(e) {
        e.preventDefault();
        return $(this).removeClass('hover');
      };
      return this.editor.el[0].ondrop = (function(_this) {
        return function(e) {
          var arr, file, _i, _len, _ref;
          e.preventDefault();
          _this.editor.el.removeClass('hover');
          arr = [];
          _ref = e.dataTransfer.files;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            file = _ref[_i];
            _this.preview(file, arr, _this.img_arr);
          }
          return _this.editor.uploader.upload(arr, _this.editor.opts.url);
        };
      })(this);
    };

    AttachmentButton.prototype.render = function() {
      this.img_arr = [];
      this.wrapper = $(this._tpl.item).appendTo(this.editor.toolbar.list);
      this.el = this.wrapper.find('a.toolbar-item');
      this.el.attr('title', this.title).addClass('toolbar-item-' + this.name).data('button', this);
      this.el.find('span').addClass(this.icon ? 'fa fa-' + this.icon : '').text(this.text);
      this.attachments = $(this._tpl.attachments).appendTo(this.editor.wrapper);
      this._initUploader(this.img_arr);
      this._initDrag();
      if (!this.menu) {

      }
    };

    return AttachmentButton;

  })(SimditorButton);

  Simditor.Toolbar.addButton(AttachmentButton);

}).call(this);
