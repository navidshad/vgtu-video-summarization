import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'

export const useGraphStore = defineStore('graph', () => {
  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])

  const addNode = (node: Node) => {
    nodes.value.push(node)
  }

  const addEdge = (edge: Edge) => {
    edges.value.push(edge)
  }

  const setNodes = (newNodes: Node[]) => {
    nodes.value = newNodes
  }

  const setEdges = (newEdges: Edge[]) => {
    edges.value = newEdges
  }

  return { nodes, edges, addNode, addEdge, setNodes, setEdges }
})
