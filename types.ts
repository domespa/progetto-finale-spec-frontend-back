export type Product = {
  title: string;
  category: string;
  cpu?: string;
  speedCpu?: number;
  ram?: number;
  hardDriveType?: string;
  storage?: number;
  gpu?: string;
  gpuRam?: number;
  displayPanel?: string;
  screenInch?: number;
  refreshRate?: number;
  price: number;
  brand?: string;
  releaseYear?: number;
  image: string;
  readonly serialNumber?: string;
};

// export function isProduct(dati: unknown): dati is Product {
//   if (
//     dati &&
//     typeof dati === "object" &&
//     "id" in dati &&
//     typeof dati.id === "number" &&
//     "title" in dati &&
//     typeof dati.title === "string" &&
//     "category" in dati &&
//     typeof dati.category === "string" &&
//     "price" in dati &&
//     typeof dati.price === "number" &&
//     "image" in dati &&
//     typeof dati.image === "string"
//   ) {
//     return true;
//   } else {
//     return false;
//   }
// }
