import type { TreeNode, TreeNodeId } from "./types/tree-operations-type";
import { CheckStatus } from "./types/tree-operations-type";

/**
 * ========================
 * ==树级数据操作的工具类函数==
 * ========================
 */

const ROOT_PID = null;

type NodeExtra = object;

function normalizePid(pid: TreeNodeId | null | undefined): TreeNodeId | null {
  return pid ?? ROOT_PID;
}

function getNodeByPid<TExtra extends NodeExtra>(
  nodeById: Map<TreeNodeId, TreeNode<TExtra>>,
  pid: TreeNodeId | null | undefined
): TreeNode<TExtra> | undefined {
  const normalizedPid = normalizePid(pid);
  return normalizedPid === ROOT_PID ? undefined : nodeById.get(normalizedPid);
}

/**
 * 构建树形结构。
 * 根据扁平节点数组构建树，重复 ID 保留首个节点，孤儿节点和成环节点不会进入结果。
 * 该函数沿用现有 API，会重置输入节点的 `children`。
 *
 * @param nodes - 树节点数组，每个节点包含 `id` 和 `pid` 等属性
 * @returns 树形结构数组
 */
export function buildTree<TExtra extends NodeExtra>(nodes: Array<TreeNode<TExtra>>): Array<TreeNode<TExtra>> {
  const roots: Array<TreeNode<TExtra>> = [];
  const nodeById = new Map<TreeNodeId, TreeNode<TExtra>>();
  const uniqueNodes: Array<TreeNode<TExtra>> = [];

  // 先根据 id 创建映射，同时初始化 children 数组。
  for (const node of nodes) {
    // 存在重复节点时，保证添加的是首个节点。
    if (nodeById.has(node.id)) {
      continue;
    }

    node.children = [];
    nodeById.set(node.id, node);
    uniqueNodes.push(node);
  }

  // 沿父节点链向上检查，避免将自身或已成环的节点挂入结果树。
  function createsCycle(node: TreeNode<TExtra>, parent: TreeNode<TExtra>): boolean {
    const visited = new Set<TreeNodeId>();
    let current: TreeNode<TExtra> | undefined = parent;

    while (current && !visited.has(current.id)) {
      if (current.id === node.id) {
        return true;
      }
      visited.add(current.id);
      current = getNodeByPid(nodeById, current.pid);
    }

    return current !== undefined;
  }

  // 根据 pid 关系将节点组合成树结构。
  for (const node of uniqueNodes) {
    const pid = normalizePid(node.pid);
    if (pid === ROOT_PID) {
      // pid 为空表示根节点。
      roots.push(node);
      continue;
    }

    const parent = nodeById.get(pid);
    if (parent && !createsCycle(node, parent)) {
      // 将当前节点加入父节点的 children 数组。
      parent.children!.push(node);
    }
  }

  return roots;
}

/**
 * 将树形结构转换为扁平化数组。
 * 以前序顺序遍历节点，并保留节点上的业务扩展字段。
 *
 * @param data - 树形数据，包含 `id`、`name` 和可选的 `children` 属性
 * @returns 扁平化数组，每个节点包含重新计算的 `pid`
 */
export function treeToArr<TExtra extends NodeExtra>(data: Array<TreeNode<TExtra>>): Array<TreeNode<TExtra>> {
  const result: Array<TreeNode<TExtra>> = [];
  const visited = new Set<TreeNode<TExtra>>();
  // 使用栈执行深度优先遍历；根节点的 pid 统一设置为 null。
  const stack = data
    .map((node) => ({ node, pid: ROOT_PID as TreeNodeId | null }))
    .reverse();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || visited.has(current.node)) {
      continue;
    }

    visited.add(current.node);
    const { children = [], ...nodeWithoutChildren } = current.node;
    // 将当前节点扁平化并加入结果数组，children 不进入扁平节点。
    result.push({
      ...nodeWithoutChildren,
      pid: current.pid,
      check: current.node.check ?? CheckStatus.Unchecked
    } as TreeNode<TExtra>);

    // 逆序压栈，使输出仍保持原树中父节点和兄弟节点的顺序。
    for (let index = children.length - 1; index >= 0; index--) {
      const child = children[index];
      if (child) {
        stack.push({ node: child, pid: current.node.id });
      }
    }
  }

  // 返回最终的扁平化数组。
  return result;
}

/**
 * 更新树结构的节点选中状态。
 * 该函数处理具有多个根节点的嵌套树；选中节点的后代会被选中，父节点会根据
 * 子节点状态自动更新为选中、半选或未选中。该函数会原地修改 `tree`。
 *
 * @param tree - 嵌套树结构数组
 * @param selectedNodes - 当前选中的节点数组
 * @returns 更新后的树结构数组
 */
export function updateTreeCheckStatus<TExtra extends NodeExtra>(
  tree: Array<TreeNode<TExtra>>,
  selectedNodes: Array<TreeNode<TExtra>>
): Array<TreeNode<TExtra>> {
  const nodeById = new Map<TreeNodeId, TreeNode<TExtra>>();
  const parentByNode = new Map<TreeNode<TExtra>, TreeNode<TExtra>>();
  const allNodes: Array<TreeNode<TExtra>> = [];
  const stack = tree.map((node) => ({ node, parent: undefined as TreeNode<TExtra> | undefined }));
  const visited = new Set<TreeNode<TExtra>>();

  // 创建节点映射和子节点到父节点的映射，便于快速查找。
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || visited.has(current.node)) {
      continue;
    }

    visited.add(current.node);
    allNodes.push(current.node);
    if (!nodeById.has(current.node.id)) {
      nodeById.set(current.node.id, current.node);
    }
    if (current.parent) {
      parentByNode.set(current.node, current.parent);
    }

    for (const child of current.node.children ?? []) {
      stack.push({ node: child, parent: current.node });
    }
  }

  // 先清空历史状态，确保取消选中也能被正确反映。
  for (const node of allNodes) {
    node.check = CheckStatus.Unchecked;
  }

  // 更新节点及其所有子节点的选中状态。
  function setDescendantsChecked(start: TreeNode<TExtra>): void {
    const descendants = [start];
    const checked = new Set<TreeNode<TExtra>>();

    while (descendants.length > 0) {
      const node = descendants.pop();
      if (!node || checked.has(node)) {
        continue;
      }
      checked.add(node);
      node.check = CheckStatus.Checked;
      descendants.push(...(node.children ?? []));
    }
  }

  // 首先设置选中节点及其后代的状态。
  for (const selectedNode of selectedNodes) {
    const target = nodeById.get(selectedNode.id);
    if (target) {
      setDescendantsChecked(target);
    }
  }

  // 根据直接子节点的状态，逐级更新父节点的选中状态。
  function updateAncestors(start: TreeNode<TExtra>): void {
    const updated = new Set<TreeNode<TExtra>>();
    let parent = parentByNode.get(start);

    while (parent && !updated.has(parent)) {
      updated.add(parent);
      const children = parent.children ?? [];
      const allChecked = children.length > 0 && children.every((child) => child.check === CheckStatus.Checked);
      const allUnchecked = children.every((child) => child.check === CheckStatus.Unchecked);
      parent.check = allChecked
        ? CheckStatus.Checked
        : (allUnchecked ? CheckStatus.Unchecked : CheckStatus.HalfChecked);
      parent = parentByNode.get(parent);
    }
  }

  // 更新选中节点及其父节点的状态。
  for (const selectedNode of selectedNodes) {
    const target = nodeById.get(selectedNode.id);
    if (target) {
      updateAncestors(target);
    }
  }

  return tree;
}

/**
 * 更新扁平数组格式的树结构的节点选中状态。
 * 选中节点的后代会被选中，父节点会根据子节点状态自动更新为选中、半选或未选中。
 * 该函数会原地修改 `tree`。
 *
 * @param tree - 扁平数组格式的树结构
 * @param selectedNodes - 当前选中的节点数组
 * @returns 更新后的扁平数组格式树结构
 */
export function updateTreeCheckStatusFlat<TExtra extends NodeExtra>(
  tree: Array<TreeNode<TExtra>>,
  selectedNodes: Array<TreeNode<TExtra>>
): Array<TreeNode<TExtra>> {
  const nodeById = new Map<TreeNodeId, TreeNode<TExtra>>();
  const childrenByPid = new Map<TreeNodeId | null, Array<TreeNode<TExtra>>>();

  // 创建节点映射和父节点到子节点的映射，并清空历史选中状态。
  for (const node of tree) {
    if (!nodeById.has(node.id)) {
      nodeById.set(node.id, node);
    }
    const pid = normalizePid(node.pid);
    const children = childrenByPid.get(pid) ?? [];
    children.push(node);
    childrenByPid.set(pid, children);
    node.check = CheckStatus.Unchecked;
  }

  // 设置节点及其全部后代的选中状态。
  function setDescendantsChecked(start: TreeNode<TExtra>): void {
    const stack = [start];
    const visited = new Set<TreeNodeId>();

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node || visited.has(node.id)) {
        continue;
      }
      visited.add(node.id);
      node.check = CheckStatus.Checked;
      stack.push(...(childrenByPid.get(node.id) ?? []));
    }
  }

  // 首先设置选中节点及其后代的状态。
  for (const selectedNode of selectedNodes) {
    const target = nodeById.get(selectedNode.id);
    if (target) {
      setDescendantsChecked(target);
    }
  }

  // 根据直接子节点的状态，逐级更新父节点的选中状态。
  function updateAncestors(start: TreeNode<TExtra>): void {
    const visited = new Set<TreeNodeId>();
    let parent = getNodeByPid(nodeById, start.pid);

    while (parent && !visited.has(parent.id)) {
      visited.add(parent.id);
      const children = childrenByPid.get(parent.id) ?? [];
      const allChecked = children.length > 0 && children.every((child) => child.check === CheckStatus.Checked);
      const allUnchecked = children.every((child) => child.check === CheckStatus.Unchecked);
      parent.check = allChecked
        ? CheckStatus.Checked
        : (allUnchecked ? CheckStatus.Unchecked : CheckStatus.HalfChecked);
      parent = getNodeByPid(nodeById, parent.pid);
    }
  }

  // 更新选中节点及其父节点的状态。
  for (const selectedNode of selectedNodes) {
    const target = nodeById.get(selectedNode.id);
    if (target) {
      updateAncestors(target);
    }
  }

  return tree;
}

/**
 * 在树形结构中根据关键词查找相关节点，并返回匹配节点、父节点和子节点。
 * 结果保持原数组顺序。
 *
 * @param treeArr - 树形数据数组，节点至少包含 `id`、`pid` 和 `name` 属性
 * @param keywords - 用于匹配节点 `name` 属性的关键词
 * @param mark - 是否为直接匹配的节点标记 `isMatched` 属性
 * @returns 匹配节点及其全部祖先和后代
 */
export function searchTreeWithRelations<TExtra extends NodeExtra>(
  treeArr: Array<TreeNode<TExtra>> = [],
  keywords: string = "",
  mark: boolean = true
): Array<TreeNode<TExtra>> {
  const nodeById = new Map<TreeNodeId, TreeNode<TExtra>>();
  const childrenByPid = new Map<TreeNodeId | null, Array<TreeNode<TExtra>>>();
  const matchedIds = new Set<TreeNodeId>();
  const includedIds = new Set<TreeNodeId>();

  // 1. 构建 id 到节点、pid 到子节点的映射，并记录直接匹配的节点。
  for (const node of treeArr) {
    if (!nodeById.has(node.id)) {
      nodeById.set(node.id, node);
    }
    const pid = normalizePid(node.pid);
    const children = childrenByPid.get(pid) ?? [];
    children.push(node);
    childrenByPid.set(pid, children);

    if ((node.name ?? "").includes(keywords)) {
      matchedIds.add(node.id);
      includedIds.add(node.id);
    }
  }

  // 2. 从直接匹配节点开始，查找并收集全部后代节点。
  const descendantQueue = [...matchedIds];
  for (let index = 0; index < descendantQueue.length; index++) {
    const id = descendantQueue[index];
    if (id === undefined) {
      continue;
    }
    for (const child of childrenByPid.get(id) ?? []) {
      if (!includedIds.has(child.id)) {
        includedIds.add(child.id);
        descendantQueue.push(child.id);
      }
    }
  }

  // 3. 沿 pid 链向上查找全部父节点，并通过 visited 防止循环引用。
  for (const matchedId of matchedIds) {
    const visited = new Set<TreeNodeId>();
    let parent = getNodeByPid(nodeById, nodeById.get(matchedId)?.pid);

    while (parent && !visited.has(parent.id)) {
      visited.add(parent.id);
      includedIds.add(parent.id);
      parent = getNodeByPid(nodeById, parent.pid);
    }
  }

  // 按输入顺序输出；仅直接匹配的节点会被标记。
  return treeArr
    .filter((node) => includedIds.has(node.id))
    .map((node) => mark && matchedIds.has(node.id)
      ? { ...node, isMatched: true } as TreeNode<TExtra>
      : node);
}

/**
 * 从树形结构中移除指定的节点及其所有后代，结果保持原数组顺序。
 *
 * @param treeArr - 当前的扁平树形结构数组
 * @param selectedNodes - 要移除的节点数组
 * @returns 过滤后的扁平树形结构数组
 */
export function removeNodesFromTree<TExtra extends NodeExtra>(
  treeArr: Array<TreeNode<TExtra>> = [],
  selectedNodes: Array<TreeNode<TExtra>> = []
): Array<TreeNode<TExtra>> {
  const childrenByPid = new Map<TreeNodeId | null, Array<TreeNode<TExtra>>>();
  // 使用 Set 存储需要移除的节点 ID，便于快速查找并避免重复。
  const idsToRemove = new Set<TreeNodeId>(selectedNodes.map((node) => node.id));

  // 构建父节点到子节点的映射，以便递归扩展删除范围。
  for (const node of treeArr) {
    const pid = normalizePid(node.pid);
    const children = childrenByPid.get(pid) ?? [];
    children.push(node);
    childrenByPid.set(pid, children);
  }

  // 从指定节点开始，迭代收集所有层级的后代节点。
  const queue = [...idsToRemove];
  for (let index = 0; index < queue.length; index++) {
    const id = queue[index];
    if (id === undefined) {
      continue;
    }
    for (const child of childrenByPid.get(id) ?? []) {
      if (!idsToRemove.has(child.id)) {
        idsToRemove.add(child.id);
        queue.push(child.id);
      }
    }
  }

  // 返回过滤后的树形结构，移除指定节点及其所有后代。
  return treeArr.filter((node) => !idsToRemove.has(node.id));
}

/**
 * 合并节点数组到已有的树形结构中。
 * 支持待合并节点乱序；重复、孤儿和成环节点会被忽略。
 * 该函数沿用现有 API，会原地追加到 `treeArr`。
 *
 * @param treeArr - 现有的扁平树形结构数组
 * @param nodes - 要合并的节点数组
 * @returns 合并后的树形结构数组
 */
export function mergeTrees<TExtra extends NodeExtra>(
  treeArr: Array<TreeNode<TExtra>> = [],
  nodes: Array<TreeNode<TExtra>> = []
): Array<TreeNode<TExtra>> {
  // 存储现有树中所有节点的 id，便于判断节点是否已存在以及父节点是否可用。
  const existingIds = new Set<TreeNodeId>(treeArr.map((node) => node.id));
  // 重复节点只保留首个，已存在于树中的节点不再进入待处理队列。
  let pending = nodes.filter((node, index) =>
    !existingIds.has(node.id)
    && nodes.findIndex((candidate) => candidate.id === node.id) === index);

  while (pending.length > 0) {
    const nextPending: Array<TreeNode<TExtra>> = [];
    let added = 0;

    // 每轮添加根节点或父节点已经存在的节点，以支持输入节点乱序。
    for (const node of pending) {
      const pid = normalizePid(node.pid);
      if (pid === ROOT_PID || existingIds.has(pid)) {
        treeArr.push(node);
        existingIds.add(node.id);
        added++;
      } else {
        nextPending.push(node);
      }
    }

    // 一轮中没有节点可添加，说明剩余节点为孤儿节点或存在环。
    if (added === 0) {
      break;
    }
    pending = nextPending;
  }

  return treeArr;
}

/**
 * 从树形结构中选择与给定节点相关的所有父节点和子节点。
 * 结果保持原数组顺序。
 *
 * @param treeData - 扁平树形结构数组
 * @param selectedNodes - 选中的节点数组
 * @returns 选中节点、其全部祖先和全部后代
 */
export function selectRelatedNodes<TExtra extends NodeExtra>(
  treeData: Array<TreeNode<TExtra>>,
  selectedNodes: Array<TreeNode<TExtra>> = []
): Array<TreeNode<TExtra>> {
  const nodeById = new Map<TreeNodeId, TreeNode<TExtra>>();
  const childrenByPid = new Map<TreeNodeId | null, Array<TreeNode<TExtra>>>();
  const includedIds = new Set<TreeNodeId>();

  // 1. 构建 id 到节点和 pid 到子节点的映射。
  for (const node of treeData) {
    if (!nodeById.has(node.id)) {
      nodeById.set(node.id, node);
    }
    const pid = normalizePid(node.pid);
    const children = childrenByPid.get(pid) ?? [];
    children.push(node);
    childrenByPid.set(pid, children);
  }

  // 使用 Set 存储已选择节点的 id，避免重复。
  const queue: TreeNodeId[] = [];
  for (const selectedNode of selectedNodes) {
    if (nodeById.has(selectedNode.id) && !includedIds.has(selectedNode.id)) {
      includedIds.add(selectedNode.id);
      queue.push(selectedNode.id);
    }
  }

  // 2. 查找当前节点的所有子节点，并迭代处理每个后代节点。
  for (let index = 0; index < queue.length; index++) {
    const id = queue[index];
    if (id === undefined) {
      continue;
    }
    for (const child of childrenByPid.get(id) ?? []) {
      if (!includedIds.has(child.id)) {
        includedIds.add(child.id);
        queue.push(child.id);
      }
    }
  }

  // 3. 沿 pid 链查找所有父节点，并通过 visited 防止循环引用。
  for (const selectedNode of selectedNodes) {
    const visited = new Set<TreeNodeId>();
    let parent = getNodeByPid(nodeById, nodeById.get(selectedNode.id)?.pid);

    while (parent && !visited.has(parent.id)) {
      visited.add(parent.id);
      includedIds.add(parent.id);
      parent = getNodeByPid(nodeById, parent.pid);
    }
  }

  // 4. 按原树顺序返回与选中节点相关的父子节点。
  return treeData.filter((node) => includedIds.has(node.id));
}
export { CheckStatus };
export type { CheckStatusType, TreeNode, TreeNodeId } from "./types/tree-operations-type";