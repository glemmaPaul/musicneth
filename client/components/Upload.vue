<template>

  <div>
    <input enctype="multipart/form-data" @change="handleUpload($event.target.files);" accept="audio/*" type="file" name="audio" />
  </div>
</template>

<script>
import {ipcRenderer} from 'electron'

export default {
  methods: {
    handleUpload(fileList) {
      // handle file changes
      const filesArray = []

      if (!fileList.length) return;

      // append the files to FormData
      Array
        .from(Array(fileList.length).keys())
        .map(x => {
          filesArray.push(fileList[x].path)
        });

      ipcRenderer.send('drop-files', filesArray)
    }
  }

}
</script>
