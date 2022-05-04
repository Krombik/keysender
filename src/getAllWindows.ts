import { _getAllWindows } from "./addon";
import { normalizeWindowInfo } from "./utils";

const getAllWindows = () => _getAllWindows().map(normalizeWindowInfo);

export default getAllWindows;
