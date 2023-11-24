export interface FileDetails {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly url?: string;
  readonly file?: File;
}

// export class FileCollection {
//   [index: number]: FileDetails;

//   private files: FileDetails[] = [];
//   private index = 0;

//   private static indexedHandler: ProxyHandler<FileCollection> = {
//     get(target, property) {
//       return target.get(property as any);
//     },
//     set(target, property, value): boolean {
//       target.files[property as any] = value;
//       return true;
//     }
//   };

//   constructor(
//     files?: FileList,
//   ) {
//     if (files) {
//       for (let i = 0; i < files.length; ++i) {
//         this.files.push({
//           name: files[i].name,
//           size: files[i].size,
//           type: files[i].type,
//           file: files[i],
//         });
//       }
//     }
//     return new Proxy(this, FileCollection.indexedHandler);
//   }

//   public get(index: number): FileDetails | undefined {
//     return this.files[index];
//   }

//   public next(): FileDetails | undefined {
//     if (this.index < this.files.length)
//       return this.files[this.index++];
//     return undefined;
//   }

//   public reset(): void {
//     this.index = 0;
//   }

//   public list(): readonly FileDetails[] {
//     return this.files;
//   }

//   get length(): number {
//     return this.files.length;
//   }

//   public push(file: FileDetails): void {
//     this.files.push(file);
//   }

//   public remove(index: number): void {
//     this.files.splice(index, 1);
//   }

//   public clear(): void {
//     this.files = [];
//   }

//   public toFileList(): FileList {
//     const dt = new DataTransfer();
//     for (let i = 0; i < this.files.length; ++i) {
//       const file = this.files[i].file;
//       if (file) dt.items.add(file);
//     }
//     return dt.files;
//   }
// }
