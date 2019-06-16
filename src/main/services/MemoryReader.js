import memoryjs from "memoryjs";
import Status from "./IsaacStatus";

const ISAAC_PROC_NAME = "isaac-ng.exe";

let isaacPid;
let currentStatus;
let process;
let mainModule;
let loadingMemory;
let playerManagerInstructPointer;
let playerManagerPlayerListOffset;

const versionPattern = "42 69 6e 64 69 6e 67 20 6f 66 20 49 73 61 61 63 3a"; // 'B', 'i', 'n', 'd', 'i', 'n', 'g', ' ', 'o', 'f', ' ', 'I', 's', 'a', 'a', 'c', ':' in bytes
const playerManagerPattern = "89 44 24 34 A1 ? ? ? ? 85 C0";
const playerManagerPlayerListOffsetPattern = "8B 35 ? ? ? ? 8B 86 ? ? ? ? 2B 86";

const reset = () => {
  isaacPid = 0;
  currentStatus = Status.SEARCHING;
  loadingMemory = false;
};

const update = async () => {
  try {
    process = memoryjs.openProcess(ISAAC_PROC_NAME);
  } catch (error) {
    reset();
    return;
  }

  if(loadingMemory || isaacPid === process.th32ProcessID) return;

  isaacPid = process.th32ProcessID;
  loadingMemory = true;
  currentStatus = Status.LOADING;

  mainModule =  memoryjs.findModule(ISAAC_PROC_NAME, isaacPid);

  const checkVersion = () => {
    const versionAddress = memoryjs.findPattern(process.handle, ISAAC_PROC_NAME, versionPattern, memoryjs.NORMAL, 0, 0);
    if(versionAddress < 0) return false;
    const versionCharA = memoryjs.readMemory(process.handle, versionAddress + 18, memoryjs.BYTE); // should be A
    const versionCharPlus = memoryjs.readMemory(process.handle, versionAddress + 28, memoryjs.BYTE); // should be +
    return versionCharA === 65 && versionCharPlus === 43;  // is A and +
  }

  if(!checkVersion()){
    loadingMemory = false;
    currentStatus = Status.NOT_SUPPORTED_VERSION;
    return;
  }

  const playerManagerIntructPointerAddr = memoryjs.findPattern(process.handle, ISAAC_PROC_NAME, playerManagerPattern, memoryjs.NORMAL, 0, 0);
  playerManagerInstructPointer = memoryjs.readMemory(process.handle, playerManagerIntructPointerAddr + 5, memoryjs.UINT32);

  const playerManagerPlayerListOffsetAddr = memoryjs.findPattern(process.handle, ISAAC_PROC_NAME, playerManagerPlayerListOffsetPattern, memoryjs.NORMAL, 0, 0);
  playerManagerPlayerListOffset =  memoryjs.readBuffer(process.handle, playerManagerPlayerListOffsetAddr + 14, 2).readUInt16LE();

  loadingMemory = false;
  currentStatus = Status.READY;
};


const readInt = (addr, size = 4) => {
  const fromType = (type) => memoryjs.readMemory(process.handle, addr, type);
  switch (size) {
    case 1:
      return fromType(memoryjs.BYTE);
    case 2:
      return fromType(memoryjs.SHORT);
    case 4:
      return fromType(memoryjs.INT);
    case 8:
      return fromType(memoryjs.LONG);
    default:
      return 0;
  }
}

const getPlayerManagetInstruct = () => {
  return readInt(playerManagerInstructPointer);
}

const getNumberOfPlayers = (playerManagetInstruct) => {
  if (!playerManagetInstruct) {
      playerManagetInstruct = getPlayerManagetInstruct();
      if (!playerManagetInstruct) return 0;
  }

  const playerListPointer = playerManagetInstruct + playerManagerPlayerListOffset;
  const numberOfPlayersX4 = readInt(playerListPointer + 4) - readInt(playerListPointer);
  return numberOfPlayersX4 / 4;
}

const getPlayer = () => {
  const playerManagetInstruct = getPlayerManagetInstruct();
  if (playerManagetInstruct === 0) return 0;

  const numberOfPlayers = getNumberOfPlayers(playerManagetInstruct);
  if (numberOfPlayers === 0) return 0;

  const playerPointer = readInt(playerManagetInstruct + playerManagerPlayerListOffset);
  return playerPointer === 0 ? 0 : readInt(playerPointer);
}

class MemoryReader {
  init(callback, interval = 1000) {
    setInterval(() => update().then(() => {
      if(callback) callback(currentStatus);
    }), interval);
  }

  getPlayerManagerInfo(offset, size = 4){
    const playerManagetInstruct = getPlayerManagetInstruct();
    if (!playerManagetInstruct) return 0;
    const numberOfPlayers = getNumberOfPlayers(playerManagetInstruct);
    return numberOfPlayers === 0 ? 0 : readInt(playerManagetInstruct + offset, size);
  }

  getPlayerInfo(offset, size = 4) {
    const player = getPlayer();
    return player === 0 ? 0 : readInt(player + offset, size);
  }

  readInt(addr, size){
    return readInt(addr, size);
  }
}

export default new MemoryReader();
