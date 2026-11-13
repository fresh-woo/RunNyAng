// Sprite and image asset loader & cache for RunNyAng
import catRun1Url from '../../assets/images/cat/cat_run_1.png';
import catRun2Url from '../../assets/images/cat/cat_run_2.png';
import catRun3Url from '../../assets/images/cat/cat_run_3.png';
import catHurtUrl from '../../assets/images/cat/cat_hurt.png';
import itemChuruUrl from '../../assets/images/stage/item_churu.png';
import itemCanUrl from '../../assets/images/stage/item_can.png';
import obsBusUrl from '../../assets/images/stage/obs_bus.png';
import obsCoffeeUrl from '../../assets/images/stage/obs_coffee.png';
import obsBooksUrl from '../../assets/images/stage/obs_books.png';
import obsConeUrl from '../../assets/images/stage/obs_cone.png';

export interface GameAssets {
  catRunFrames: (HTMLImageElement | null)[];
  catHurt: HTMLImageElement | null;
  stageAssets: {
    itemChuru: HTMLImageElement | null;
    itemCan: HTMLImageElement | null;
    obsBus: HTMLImageElement | null;
    obsCoffee: HTMLImageElement | null;
    obsBooks: HTMLImageElement | null;
    obsCone: HTMLImageElement | null;
  };
}

let cachedAssets: GameAssets | null = null;

const loadImage = (url: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      console.warn(`Failed to load image from ${url}`, err);
      resolve(null);
    };
    img.src = url;
  });
};

export const loadGameAssets = async (): Promise<GameAssets> => {
  if (cachedAssets) return cachedAssets;

  const [
    cat1,
    cat2,
    cat3,
    catHurt,
    itemChuru,
    itemCan,
    obsBus,
    obsCoffee,
    obsBooks,
    obsCone,
  ] = await Promise.all([
    loadImage(catRun1Url),
    loadImage(catRun2Url),
    loadImage(catRun3Url),
    loadImage(catHurtUrl),
    loadImage(itemChuruUrl),
    loadImage(itemCanUrl),
    loadImage(obsBusUrl),
    loadImage(obsCoffeeUrl),
    loadImage(obsBooksUrl),
    loadImage(obsConeUrl),
  ]);

  cachedAssets = {
    catRunFrames: [cat1, cat2, cat3],
    catHurt,
    stageAssets: {
      itemChuru,
      itemCan,
      obsBus,
      obsCoffee,
      obsBooks,
      obsCone,
    },
  };

  return cachedAssets;
};

