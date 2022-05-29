import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Plugins, FilesystemDirectory } from '@capacitor/core';
const { Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class AjxService {

  public videos = [];
  private VIDEOS_KEY: string = 'videos';

  constructor(public router: Router) { }

  async loadVideos() {
    const videoList = await Storage.get({ key: this.VIDEOS_KEY });
    this.videos = JSON.parse(videoList.value) || [];
    return this.videos;
  }

  async storeVideo(blob) {
    const fileName = new Date().getTime() + '.mp4';

    const base64Data = await this.convertBlobToBase64(blob) as string;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    // Add file to local array
    this.videos.unshift(savedFile.uri);

    // Write information to storage
    return Storage.set({
      key: this.VIDEOS_KEY,
      value: JSON.stringify(this.videos)
    });
  }

  // Helper function
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  // Load video as base64 from url
  async getVideoUrl(fullPath) {
    const path = fullPath.substr(fullPath.lastIndexOf('/') + 1);
    const file = await Filesystem.readFile({
      path: path,
      directory: FilesystemDirectory.Data
    });
    return `data:video/mp4;base64,${file.data}`;
  }
}
