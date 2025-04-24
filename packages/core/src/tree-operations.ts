import type { CheckStatusType, TreeNode } from "./types/tree-operations-type";
import { CheckStatus } from "./types/tree-operations-type";

/**
 * ========================
 * ==树级数据操作的工具类函数==
 * ========================
 */

/**
 * 构建树形结构
 * @param {Array} nodes - 树节点数组，每个节点包含 `id` 和 `pid` 等属性
 * @param {boolean} [preserveChildren] - 是否保留原节点的 `children` 属性
 * @returns {Array} - 树形结构数组
 */
export function buildTree(nodes: TreeNode[]): TreeNode[] {
  const tree: TreeNode[] = [];
  const idToNodeMap = new Map<string | number, TreeNode>();
  const idToChildMap = new Map<string | number, (string | number)[]>();

  // 先根据 id 创建一个映射
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) { // 如果 node 为 undefined，则跳过
      continue;
    }
    // 存在重复节点保证添加的是首个
    if (!idToNodeMap.has(node.id)) {
      idToNodeMap.set(node.id, node);
    }
    idToChildMap.set(node.id, []);
    node.children = []; // 初始化 children 数组
  }

  // 根据 pid 关系将节点组合成树结构
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) { // 如果 node 为 undefined，则跳过
      continue;
    }
    if (node.pid === null) {
      tree.push(node); // 根节点
    } else {
      const parent = idToNodeMap.get(node.pid);
      const childrenIds = parent ? idToChildMap.get(parent.id) : [];
      if (parent && !childrenIds?.includes(Number(node.id))) {
        idToChildMap.get(parent.id)?.push(node.id);
        parent.children?.push(node); // 将当前节点加入父节点的 children 数组
      }
    }
  }

  return tree;
}


/**
 * 将树形结构转换为扁平化数组
 * @param {TreeNode[]} data - 树形数据，包含 `id`, `name` 和可选的 `children` 属性
 * @returns {Array} - 扁平化的数组，包含节点的 `id`, `name`, 和 `pid`
 */
export function treeToArr(data: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];

  /**
   * 深度优先递归遍历树
   * @param {TreeNode[]} tree - 当前树的节点数组
   * @param {number | null} pid - 当前节点的父节点 ID
   */
  function deep(tree: TreeNode[], pid: string | number | null = null): void {
    for (const item of tree) {
      const { id, name, children = [] } = item;

      // 如果当前节点有子节点，递归遍历子节点
      if (children.length > 0) {
        deep(children, id); // 传递当前节点的 id 作为子节点的 pid
      }

      // 将当前节点扁平化并加入结果数组
      result.push({
        id,
        name,
        pid,
        check: CheckStatus.Unchecked
      });
    }
  }

  // 从根节点开始遍历
  deep(data);

  // 返回最终的扁平化数组
  return result;
}


/**
 * 更新树结构的节点选中状态。
 * 该函数处理具有多个根节点的树结构，当选中或取消选中某些节点时，更新整个树的状态。
 * 父节点的状态会根据其子节点的状态自动变为选中、半选或未选中。
 *
 * @param {TreeNode[]} tree - 树结构的数组，每个节点包含 id, name, pid, children, check 属性。
 * @param {TreeNode[]} selectedNodes - 选中的节点数组，每个节点同样包含 id, name, pid, children, check 属性。
 * @returns {TreeNode[]} 返回更新后的树结构数组。
 */
export function updateTreeCheckStatus(tree: TreeNode[], selectedNodes: TreeNode[]): TreeNode[] {
  const nodeMap = new Map<string | number, TreeNode>();

  // 创建节点映射，便于快速查找节点
  function createNodeMap(nodes: TreeNode[], map: Map<string | number, TreeNode>): void {
    nodes.forEach((node) => {
      map.set(node.id, node);
      if (node.children && node.children.length > 0) {
        createNodeMap(node.children, map);
      }
    });
  }

  // 更新节点及其子节点的选中状态
  function updateChildrenCheck(node: TreeNode, checkStatus: CheckStatusType): void {
    node.check = checkStatus;
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => updateChildrenCheck(child, checkStatus));
    }
  }

  // 更新节点及其父节点的选中状态
  function updateParentCheck(node: TreeNode): void {
    const parent = nodeMap.get(node.pid ?? -1); // 使用 `pid ?? -1` 来处理 `null` 的情况
    if (parent) {
      const allChecked = parent.children?.every((child) => child.check === CheckStatus.Checked) ?? false;
      const allUnchecked = parent.children?.every((child) => child.check === CheckStatus.Unchecked) ?? false;

      if (allChecked) {
        parent.check = CheckStatus.Checked;
      } else if (allUnchecked) {
        parent.check = CheckStatus.Unchecked;
      } else {
        parent.check = CheckStatus.HalfChecked;
      }
      updateParentCheck(parent); // 递归更新父节点状态
    }
  }

  // 初始化节点映射
  createNodeMap(tree, nodeMap);

  // 首先设置选中节点的状态
  selectedNodes.forEach((node) => {
    const targetNode = nodeMap.get(node.id);
    if (targetNode) {
      updateChildrenCheck(targetNode, CheckStatus.Checked); // 选中节点及其所有子节点
    }
  });

  // 更新选中节点及其父节点的状态
  selectedNodes.forEach((node) => {
    const targetNode = nodeMap.get(node.id);
    if (targetNode) {
      updateParentCheck(targetNode); // 更新父节点状态
    }
  });

  return tree;
}

/**
 * 更新扁平数组格式的树结构的节点选中状态。
 * 该函数处理扁平数组形式的树结构，当选中或取消选中某些节点时，更新整个树的状态。
 * 父节点的状态会根据其子节点的状态自动变为选中、半选或未选中。
 *
 * @param {TreeNode[]} tree - 扁平数组格式的树结构，每个节点包含 id, name, pid, check 属性，children 属性可以为空。
 * @param {TreeNode[]} selectedNodes - 选中的节点数组，每个节点同样包含 id, name, pid, check 属性。
 * @returns {TreeNode[]} 返回更新后的扁平数组格式的树结构。
 */
export function updateTreeCheckStatusFlat(tree: TreeNode[], selectedNodes: TreeNode[]): TreeNode[] {
  const idToNodeMap = new Map<string | number, TreeNode>();
  const pidToChildrenMap = new Map<string | number | null, TreeNode[]>();

  // 创建节点映射和父节点到子节点的映射
  tree.forEach((node) => {
    idToNodeMap.set(node.id, node);
    if (!pidToChildrenMap.has(node.pid ?? -1)) {
      pidToChildrenMap.set(node.pid ?? -1, []);
    }
    pidToChildrenMap.get(node.pid ?? -1)!.push(node);
  });

  // 设置节点选中状态
  function setCheckStatus(node: TreeNode, status: CheckStatusType): void {
    node.check = status;
    if (pidToChildrenMap.has(node.id)) {
      pidToChildrenMap.get(node.id)!.forEach((child) => setCheckStatus(child, status));
    }
  }

  // 更新父节点的选中状态
  function updateParentCheck(node: TreeNode): void {
    const parent = idToNodeMap.get(node.pid ?? -1);
    if (parent) {
      const children = pidToChildrenMap.get(parent.id) ?? [];
      const allChecked = children.every((child) => child.check === CheckStatus.Checked);
      const allUnchecked = children.every((child) => child.check === CheckStatus.Unchecked);
      parent.check = allChecked ? CheckStatus.Checked : (allUnchecked ? CheckStatus.Unchecked : CheckStatus.HalfChecked);
      updateParentCheck(parent);
    }
  }

  // 首先设置选中节点的状态
  selectedNodes.forEach((node) => {
    const targetNode = idToNodeMap.get(node.id);
    if (targetNode) {
      setCheckStatus(targetNode, CheckStatus.Checked); // 选中节点及其所有子节点
    }
  });

  // 更新选中节点及其父节点的状态
  selectedNodes.forEach((node) => {
    const targetNode = idToNodeMap.get(node.id);
    if (targetNode) {
      updateParentCheck(targetNode); // 更新父节点状态
    }
  });

  return tree;
}


/**
 * 在树形结构中根据关键词查找相关节点，并返回包含匹配节点、父节点和子节点的结果。
 *
 * @param {Array} treeArr - 树形数据数组，每个元素应为一个节点对象，节点对象至少包含 `id`, `pid`, `name` 属性。
 * @param {string} keywords - 用于查找的关键词，匹配节点的 `name` 属性。
 * @param {boolean} mark - 是否在结果中标记 `isMatched` 属性。
 * @returns {Array} - 返回匹配的节点数组，包含匹配的节点及其父节点和子节点，顺序为父节点在前、子节点在后。
 */
export function searchTreeWithRelations(treeArr: TreeNode[] = [], keywords: string = "", mark: boolean = true): TreeNode[] { // 返回匹配的节点数组
  const resultSet = new Set<string | number>(); // 使用 Set 来避免重复节点
  const idToNodeMap = new Map<string | number | null, TreeNode>(); // id 到节点的映射
  const pidToChildrenMap = new Map<string | number | null, TreeNode[]>(); // pid 到子节点的映射
  const result: TreeNode[] = []; // 存放最终结果的数组

  // 1. 构建 id 到节点映射和 pid 到子节点的映射，并预处理匹配的节点
  treeArr.forEach((node) => {
    const isMatched = node.name.includes(keywords);
    idToNodeMap.set(node.id, node); // 通过 id 映射到具体节点
    if (!pidToChildrenMap.has(node.pid)) {
      pidToChildrenMap.set(node.pid, []); // 如果父节点不存在，初始化一个空数组
    }
    pidToChildrenMap.get(node.pid)!.push(node); // 将当前节点添加到父节点的子节点数组中
    if (isMatched) {
      resultSet.add(node.id); // 使用 Set 来避免重复
      result.push(mark
        ? {
            ...node,
            isMatched
          }
        : node);
    }
  });

  // 2. 查找当前节点的子节点，并递归地处理子节点
  function findChildren(node: TreeNode): void {
    const children = pidToChildrenMap.get(node.id);
    if (children) {
      children.forEach((child) => {
        // 如果子节点没有被加入结果集，则添加
        if (!resultSet.has(child.id)) {
          resultSet.add(child.id);
          result.push(child); // 将子节点加入到结果数组中
        }
        findChildren(child); // 递归查找子节点
      });
    }
  }

  // 3. 查找所有父节点
  function findParent(node: TreeNode): void {
    let parent = idToNodeMap.get(node.pid);
    while (parent) {
      // 如果父节点没有被加入结果集，则添加
      if (!resultSet.has(parent.id)) {
        resultSet.add(parent.id);
        result.unshift(parent); // 将父节点插入到结果数组的最前面
      }
      parent = idToNodeMap.get(parent.pid); // 查找父节点的父节点
    }
  }

  treeArr.forEach((node) => {
    const isMatched = node.name.includes(keywords);
    if (isMatched) {
      findChildren(node);
      findParent(node);
    }
  });

  return result; // 返回查找结果
}

/**
 * 从树形结构中移除指定的节点
 * @param {Array} treeArr - 当前的扁平树形结构数组，每个节点对象包含 `id` 和 `pid` 属性
 * @param {Array} selectedNodes - 要移除的节点数组，每个节点包含 `id` 和 `pid` 属性
 * @returns {Array} - 过滤后的扁平树形结构数组，其中移除了指定的节点及其子节点（如果父节点被移除）
 */
export function removeNodesFromTree(treeArr: TreeNode[] = [], selectedNodes: TreeNode[] = []): TreeNode[] { // 返回过滤后的树形结构数组
  // 创建一个 Set 来存储需要移除的节点 ID，便于快速查找
  const idsToRemove = new Set(selectedNodes.map((node) => node.id));

  // 过滤出不需要删除的节点
  const remainingNodes = treeArr.filter((node) => {
    // 如果节点的 ID 或其父节点 ID 在删除列表中，则该节点需要被移除
    if (idsToRemove.has(node.id) || (node.pid !== null && idsToRemove.has(node.pid))) {
      return false; // 过滤掉这些节点
    }
    return true; // 保留其他节点
  });

  // 返回过滤后的树形结构，移除了指定的节点
  return remainingNodes;
}

/**
 * 合并节点数组到已有的树形结构中
 * @param {Array} treeArr - 现有的树形结构数组，每个元素包含一个 `id` 和 `pid` 属性
 * @param {Array} nodes - 要合并的节点数组，每个节点包含一个 `id` 和 `pid` 属性
 * @returns {Array} - 合并后的树形结构数组
 */
export function mergeTrees(treeArr: TreeNode[] = [], nodes: TreeNode[] = []): TreeNode[] {
  // 创建一个 Set 用来存储现有树形结构中所有节点的 id，便于快速查找
  const nodesIdMap = new Set(treeArr.map((node) => node.id));

  // 遍历要合并的节点数组
  nodes.forEach((node) => {
    // 判断该节点的 id 是否已经存在于现有的树形结构中
    // 如果不存在，并且该节点的 pid 要么是现有树中某个节点的 id，要么 pid 为 null（表示这是根节点）
    if (
      !nodesIdMap.has(node.id) // 当前节点 id 不存在
      && (node.pid === null || nodesIdMap.has(node.pid)) // 要么父节点 id 存在，要么是根节点
    ) {
      // 将符合条件的节点添加到树形结构中
      treeArr.push(node);
    }
  });

  return treeArr; // 返回合并后的树形结构
}

/**
 * 从树形结构中选择与给定选中节点相关的所有父节点和子节点
 * @param {Array} treeData - 树形结构数组，每个节点对象包含 `id` 和 `pid` 属性
 * @param {Array} selectedNodes - 选中的节点数组，每个节点对象包含 `id` 和 `pid` 属性
 * @returns {Array} - 包含选中节点、其父节点和子节点的数组
 */
export function selectRelatedNodes(treeData: TreeNode[], selectedNodes: TreeNode[] = []): TreeNode[] {
  // 使用 Set 存储已选择节点的 id，避免重复
  const selectedNodeIds = new Set<string | number>();
  // id 到节点的映射，便于快速查找节点
  const nodeByIdMap = new Map<string | number | null, TreeNode>();
  // pid 到子节点的映射，便于快速查找某个父节点的所有子节点
  const childrenByPidMap = new Map<string | number | null, TreeNode[]>();
  // 存放最终结果的数组
  const selectedNodesAndRelated: TreeNode[] = [];
  // 用于快速查找选中的节点
  const selectedNodesMap = new Map<string | number, TreeNode>(selectedNodes.map((node) => [node.id, node]));

  // 1. 构建 id 到节点映射和 pid 到子节点的映射，并预处理选中的节点
  treeData.forEach((node) => {
    const isSelected = selectedNodesMap.get(node.id); // 判断当前节点是否为选中节点
    nodeByIdMap.set(node.id, node); // 通过 id 映射到具体节点
    if (!childrenByPidMap.has(node.pid)) {
      childrenByPidMap.set(node.pid, []); // 如果父节点不存在，初始化空数组
    }
    childrenByPidMap.get(node.pid)!.push(node); // 将当前节点添加到父节点的子节点数组中

    if (isSelected) {
      selectedNodeIds.add(node.id); // 将选中节点的 id 添加到 selectedNodeIds 中
      selectedNodesAndRelated.push(node); // 将选中节点加入到结果数组中
    }
  });

  // 2. 查找当前节点的所有子节点，并递归地处理每个子节点
  function collectChildren(node: TreeNode): void {
    const children = childrenByPidMap.get(node.id);
    if (children) {
      children.forEach((child) => {
        // 如果子节点没有被加入结果集，则添加
        if (!selectedNodeIds.has(child.id)) {
          selectedNodeIds.add(child.id);
          selectedNodesAndRelated.push(child); // 将子节点加入到结果数组中
        }
        collectChildren(child); // 递归查找该子节点的子节点
      });
    }
  }

  // 3. 查找所有父节点
  function collectParents(node: TreeNode): void {
    let parent = nodeByIdMap.get(node.pid);
    while (parent) {
      // 如果父节点没有被加入结果集，则添加
      if (!selectedNodeIds.has(parent.id)) {
        selectedNodeIds.add(parent.id);
        selectedNodesAndRelated.unshift(parent); // 将父节点插入到结果数组的最前面
      }
      parent = nodeByIdMap.get(parent.pid); // 查找父节点的父节点
    }
  }

  // 4. 遍历树形数据，查找与选中节点相关的父子节点
  treeData.forEach((node) => {
    const isSelected = selectedNodesMap.get(node.id);
    if (isSelected) {
      collectChildren(node); // 查找当前节点的子节点
      collectParents(node); // 查找当前节点的父节点
    }
  });

  return selectedNodesAndRelated; // 返回包含选中节点及其相关父子节点的数组
}