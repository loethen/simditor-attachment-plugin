class AttachmentButton extends SimditorButton

  name: 'attachment'

  icon: 'paperclip'

  title: '图片附件'

  _tpl:
    item: '<li><a tabindex="-1" unselectable="on" class="toolbar-item" href="javascript:;"><span></span><input id="upload_file" type="file" name="upload_file" tabindex="-1" multiple="true" accept="image/*"></a></li>',
    attachments: '<div class="simditor-attachments"></div>',
    thumbnails: '<div class="simditor-thumbnails"></div>',
    attachment: """
          <div class="attachment">
            <div class="thumb-wrap">
              <img src="" class="" data-image-src="" data-image-size="" data-image-name="" style="cursor: pointer;">
            </div>
            <span class="name"></span>
            <span class="size"></span>
            <div class="progress">
              <div class="progress-bar progress-bar-info progress-bar-striped"  role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
              </div>
            </div>
            <a href="javascript:;" class="link-cancel" title="移除附件"><span class="glyphicon glyphicon-remove-circle"></span></a>
          </div>
          """

  command: (param) ->
    filesinput = @el.find "#upload_file"
    filesinput.click (e) ->
      e.stopPropagation()

    img_arr = @img_arr

    @attachments.on 'click','.link-cancel',(event)->
        parent = $(@).parent();
        id = parent.attr 'id'
        id= id.slice(1)
        img_arr.splice($.inArray(id,img_arr),1)
        parent.remove()

    filesinput.change (event) =>
      arr = []
      that = event.target 
      @preview file,arr,img_arr for file in that.files
      
      @editor.uploader.upload(arr,@editor.opts.url)
      $(that).val('')

  preview: (file,arr,img_arr) =>
    attachid = md5 file.name
    if md5(file.name) in img_arr
      # check if img has been uploaded
      false
    else 
      # check if image has been uploaded
      img_arr.push attachid unless attachid in img_arr

      # waiting upload files array 
      arr.push file

      @editor.uploader.readImageFile file,(img) =>
        attach = $(@_tpl.attachment).appendTo @attachments

        attach.find 'img'
          .attr({
            'src':img.src,
            'data-image-name':file.name
          })

        attach.find '.name'
          .text file.name

        attach.find '.size'
          .text file.size//1024 + 'k'

        
        attach.attr 'id','_'+attachid

    


  _initUploader: ->

    @editor.uploader.on 'uploadprogress',(e, file, loaded, total) =>
      percent = loaded / total
      percent = (percent * 100).toFixed(0)
      percent = 99 if percent > 99


      attachid = md5(file.name)
      attach = $("#_"+attachid)

      attach.find('.progress-bar').css 'width',percent+'%'
        .attr 'aria-valuenow',percent


    @editor.uploader.on 'uploadsuccess', (e, file, result) =>
      if result.success == false
        msg = result.msg || '上传被拒绝了'
        alert msg
        
      else
        attachid = md5(file.name)
        attach = $("#_"+attachid)
        if @thumbarr? and result.file_path in @thumbarr
          attach.fadeOut 300
          return

        img  = new Image()
        img.onload = =>
          $('<img>',{
            "title": "点击图片插入编辑器",
            "alt": attachid,
            "src": result.file_path
          })
          attach.find('.thumb-wrap').html img
          attach.find '.progress'
            .hide()

        img.onerror = =>
          alert('图片可能出错了,请重新上传')

        img.src = result.file_path




  _initDrag: ->
    @editor.el[0].ondragover = (e) -> 
      e.preventDefault()
      $(@).addClass 'hover'

    @editor.el[0].ondragleave = (e) ->
      e.preventDefault()
      $(@).removeClass 'hover'

    @editor.el[0].ondrop = (e) =>
      e.preventDefault()
      @editor.el.removeClass 'hover'

      arr = []
      @preview file,arr,@img_arr for file in e.dataTransfer.files
      @editor.uploader.upload(arr,@editor.opts.url)

  render: ->
    # img has been uploaded. prevent repeat upload
    @img_arr = []

    @wrapper = $(@_tpl.item).appendTo @editor.toolbar.list
    @el = @wrapper.find 'a.toolbar-item'

    @el.attr('title', @title)
      .addClass('toolbar-item-' + @name)
      .data('button', @)

    @el.find('span')
      .addClass(if @icon then 'fa fa-' + @icon else '')
      .text(@text)

    @attachments = $(@_tpl.attachments).appendTo @editor.wrapper

    @_initUploader(@img_arr)

    @_initDrag()

    return unless @menu




Simditor.Toolbar.addButton(AttachmentButton)