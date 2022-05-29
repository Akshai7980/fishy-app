import { Component, ChangeDetectorRef } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { ActionSheetController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Storage } from '@ionic/storage';
import { FilePath } from '@ionic-native/file-path/ngx';
 
import { finalize } from 'rxjs/operators';
 
const STORAGE_KEY = 'my_images';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  images = [];

  constructor(
    private camera: Camera, 
    private file: File, 
    private http: HttpClient, 
    private webview: WebView,
    private actionSheetController: ActionSheetController, 
    private toastController: ToastController,
    private storage: Storage, 
    private plt: Platform, 
    private loadingController: LoadingController,
    private ref: ChangeDetectorRef, 
    private filePath: FilePath
    ) {

      this.plt.ready().then(() => {
        console.log('Platform Ready');
        this.loadStoredImages();
      });

    }

    loadStoredImages() {
      this.storage.get(STORAGE_KEY).then(images => {
        console.log('Stored Images');
        if (images) {
          let arr = JSON.parse(images);
          console.log('arr:',arr);
          this.images = [];
          console.log('images:',this.images);
          for (let img of arr) {
            let filePath = this.file.dataDirectory + img;
            console.log('filepath:',filePath);
            let resPath = this.pathForImage(filePath);
            console.log('resPath:',resPath);
            this.images.push({ name: img, path: resPath, filePath: filePath });
          }
        }
      });
    }

    pathForImage(img) {
      if (img === null) {
        console.log('null');
        return '';
      } else {
        let converted = this.webview.convertFileSrc(img);
        console.log('converted',converted);
        return converted;
        }
    }

    async presentToast(text) {
      console.log('Present Toast');
      const toast = await this.toastController.create({
        message: text,
        position: 'bottom',
        duration: 3000
    });
    toast.present();
    }

    async selectImage() {
      console.log('Present ActionSheet');
        const actionSheet = await this.actionSheetController.create({
            header: "Select Image source",
            buttons: [{
                    text: 'Load from Library',
                    handler: () => {
                        this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
                        console.log('Load from Library');
                    }
                },
                {
                    text: 'Use Camera',
                    handler: () => {
                        this.takePicture(this.camera.PictureSourceType.CAMERA);
                        console.log('Use Camera');
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        });
        await actionSheet.present();
    }

    takePicture(sourceType: PictureSourceType) {
      var options: CameraOptions = {
        quality: 50,
        sourceType: sourceType,
        saveToPhotoAlbum: false,
        correctOrientation: true
    };
 
    this.camera.getPicture(options).then(imagePath => {
      console.log('imagePath:',imagePath);
        if (this.plt.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
            this.filePath.resolveNativePath(imagePath)
                .then(filePath => {
                  console.log('filePath:',filePath);
                    let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
                    console.log('correctPath',correctPath);
                    let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
                    console.log('currentName',currentName);
                    this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
                });
        } else {
            var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
            console.log('correctPath',correctPath);
            var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
            console.log('currentName',currentName);
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
        }
    });
    }

    createFileName() {
        var d = new Date(),
            n = d.getTime(),
            newFileName = n + ".jpg";
            console.log('d:',d);
            console.log('n:',n);
            console.log('newFileName:',newFileName);
        return newFileName;
    }

    copyFileToLocalDir(namePath, currentName, newFileName) {

      console.log('Entered into copyFileToLocalDir fun:');

      console.log('namePath:',namePath);
      console.log('currentName:',currentName);

      this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {

        console.log('dataDirectory:',this.file.dataDirectory);
          this.updateStoredImages(newFileName);
          console.log('newFileName:',newFileName);

        }, error => {
          this.presentToast('Error while storing file.');
          console.log('Error');
      });
  }
   
    updateStoredImages(name) {
      console.log('updateStoredImages: fun');
        this.storage.get(STORAGE_KEY).then(images => {
          console.log('images:',images);
            let arr = JSON.parse(images);
            console.log('arr:',arr);
            if (!arr) {
                let newImages = [name];
                console.log('newImages:',newImages);
                this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
            } else {
                arr.push(name);
                console.log('name:',name);
                this.storage.set(STORAGE_KEY, JSON.stringify(arr));
            }
    
            let filePath = this.file.dataDirectory + name;
            console.log('filePath',filePath);
            let resPath = this.pathForImage(filePath);
            console.log('resPath',resPath);
    
            let newEntry = {
                name: name,
                path: resPath,
                filePath: filePath
            };
            console.log('newEntry',newEntry);
    
            this.images = [newEntry, ...this.images];
            console.log('images',this.images);
            this.ref.detectChanges(); // trigger change detection cycle
            console.log('trigger change detection cycle');

        });
    }

    deleteImage(imgEntry, position) {
      console.log('deleteImage fun:');
      console.log('imgEntry:',imgEntry);
      console.log('position:',position);
        this.images.splice(position, 1);
    
        this.storage.get(STORAGE_KEY).then(images => {
            let arr = JSON.parse(images);
            console.log('arr:',arr);
            let filtered = arr.filter(name => name != imgEntry.name);
            console.log('filtered',filtered);
            this.storage.set(STORAGE_KEY, JSON.stringify(filtered));
    
            var correctPath = imgEntry.filePath.substr(0, imgEntry.filePath.lastIndexOf('/') + 1);
            console.log('correctPath:',correctPath);
    
            this.file.removeFile(correctPath, imgEntry.name).then(res => {
                this.presentToast('File removed.');
                console.log('File removed.');
            });
        });
    }

      startUpload(imgEntry) {
        console.log('startUpload fun:')
        this.file.resolveLocalFilesystemUrl(imgEntry.filePath)
            .then(entry => {
                ( < FileEntry > entry).file(file => this.readFile(file))
                console.log('resolveLocalFilesystemUrl:',this.file.resolveLocalFilesystemUrl(imgEntry.filePath));
            })
            .catch(err => {
                this.presentToast('Error while reading file.');
                console.log('Error while reading file.');
            });
    }

    readFile(file: any) {
      console.log('readFile() fun');
      const reader = new FileReader();
      reader.onload = () => {
          const formData = new FormData();
          console.log('formData:',formData);
          const imgBlob = new Blob([reader.result], {
              type: file.type
          });
          console.log('imgBlob:',imgBlob);
          formData.append('file', imgBlob, file.name);
          this.uploadImageData(formData);
      };
      reader.readAsArrayBuffer(file);
  }

    async uploadImageData(formData: FormData) {
      console.log('uploadImageData fun');
      const loading = await this.loadingController.create({
          message: 'Uploading image...',
      });
      console.log('Loader....');
      await loading.present();
  
      this.http.post("http://localhost:8888/upload.php", formData)
          .pipe(
              finalize(() => {
                  loading.dismiss();
              })
          )
          .subscribe(res => {
              if (res['success']) {
                  this.presentToast('File upload complete.');
                  console.log('File upload complete.');
              } else {
                  this.presentToast('File upload failed.');
                  console.log('File upload complete.');

              }
          });
  }

}
