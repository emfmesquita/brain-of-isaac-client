const itemBlacklistOffset = 30732;
const hasItemOffset = 10096;
const touchedItensListInitOffset = 29324;
const pillsOffset = 30972;
const pubertyPillId = 9;

let touchedItemsCache = [];
let pubertyPillPoolIdCache = 0;

const itemTransformations = {
  guppy: { offset: 10268, itemIds: [81, 133, 134, 145, 187, 212] },
  beelzebub: { offset: 10272, itemIds: [9, 10, 57, 128, 148, 151, 248, 264, 272, 274, 279, 320, 364, 365, 426, 430, 434, 511] },
  funguy: { offset: 10276, itemIds: [11, 12, 71, 120, 121, 342, 398] },
  seraphim: { offset: 10280, itemIds: [33, 72, 101, 112, 173, 184, 185, 313, 363] },
  bob: { offset: 10284, itemIds: [42, 140, 149, 273] },
  spun: { offset: 10288, itemIds: [13, 14, 70, 143, 240, 345, 493, 496] },
  mom: { offset: 10292, itemIds: [29, 30, 31, 39, 41, 55, 102, 110, 114, 139, 195, 199, 200, 217, 228, 355, 508] },
  conjoined: { offset: 10296, itemIds: [8, 67, 100, 167, 268, 269, 322] },
  leviathan: { offset: 10300, itemIds: [51, 79, 80, 83, 118, 159, 230, 399] },
  ohcrap: { offset: 10304, itemIds: [36, 236, 291] },
  bookworm: { offset: 10308, itemIds: [33, 34, 35, 58, 65, 78, 97, 123, 192, 282, 287, 292, 545] },
  spiderbaby: { offset: 10316, itemIds: [89, 153, 171, 211, 288, 403] }
}

const superbum = { itemIds: [144, 278, 388] };
const adulthood = { offset: 10312 };
const stompy = { offset: 10320 };

const hasItem = (id, memoryReader) => {
  const hasItemPointer = memoryReader.getPlayerInfo(hasItemOffset);
  if(hasItemPointer === 0) return false;
  const hasItem = memoryReader.readInt(hasItemPointer + 4 * id);
  return hasItem > 0;
}

const isItemBlacklisted = (id, memoryReader) => {
  const blockListPointer = memoryReader.getPlayerManagerInfo(itemBlacklistOffset);
  if(blockListPointer === 0) return false;
  const blockByte = memoryReader.readInt(blockListPointer + Math.floor(id/8), 1);
  const itemBlockBit = Math.pow(2, id % 8);
  return (blockByte & itemBlockBit) === itemBlockBit;
}

const getItemsTouchedList = (memoryReader) => {
  const touchedItemsListInit = memoryReader.getPlayerManagerInfo(touchedItensListInitOffset);
  const touchedItemsListEnd = memoryReader.getPlayerManagerInfo(touchedItensListInitOffset + 4);

  const touchedItemsListSize = Math.floor((touchedItemsListEnd - touchedItemsListInit) / 24);

  if (touchedItemsListSize === 0) {
    touchedItemsCache = [];
    return touchedItemsCache;
  }

  if(touchedItemsCache.length === touchedItemsListSize) return touchedItemsCache;

  if (touchedItemsCache.length > touchedItemsListSize) {
    touchedItemsCache = [];
  }

  for(let i = touchedItemsCache.length; i < touchedItemsListSize; i++){
    const addressToRead = touchedItemsListInit + 4 + 24 * i;
    touchedItemsCache.push(memoryReader.readInt(addressToRead));
  }

  return touchedItemsCache;
}

const getPubertyPillPoolId = (adulthoodCount, memoryReader) => {
  if (adulthoodCount <= 0 || adulthoodCount > 3) {
    pubertyPillPoolIdCache = 0;
    return pubertyPillPoolIdCache;
  }

  if (pubertyPillPoolIdCache !== 0) {
      return pubertyPillPoolIdCache;
  }

  for (let i = 1; i <= 13; i++) {
      var pillId = memoryReader.getPlayerManagerInfo(pillsOffset + 4 * i);
      if (pillId != pubertyPillId) continue;
      pubertyPillPoolIdCache = i;
      break;
  }

  return pubertyPillPoolIdCache;
}

export default class ABPlusMemoryReader {
  constructor(memoryReader){
    this.memoryReader = memoryReader;
  }

  readGameData() {
    const transformations = {};

    const touchedItems = getItemsTouchedList(this.memoryReader);

    // all item touched based transformations
    Object.keys(itemTransformations).forEach(name => {
      const trans = itemTransformations[name];
      transformations[name] = { got: [], gone: [] };
      const result = transformations[name];

      result.count = this.memoryReader.getPlayerInfo(trans.offset);
      trans.itemIds.forEach(id => {
        if(touchedItems.indexOf(id) !== -1) result.got.push(id);
        if(isItemBlacklisted(id, this.memoryReader)) result.gone.push(id);
      });
    });

    // super bum
    transformations.superbum = { got: [], gone: [] };
    superbum.itemIds.forEach(id => {
      if (hasItem(id, this.memoryReader)) transformations.superbum.got.push(id);
      if (isItemBlacklisted(id, this.memoryReader)) transformations.superbum.gone.push(id);
    });
    transformations.superbum.count = transformations.superbum.got.length;

    // adulthood
    const adulthoodCount = this.memoryReader.getPlayerInfo(adulthood.offset);
    transformations.adulthood = {
      count: adulthoodCount,
      pillId: getPubertyPillPoolId(adulthoodCount, this.memoryReader)
    }

    // stompy
    transformations.stompy = {
      count: this.memoryReader.getPlayerInfo(stompy.offset)
    }

    return transformations;
  }
}
