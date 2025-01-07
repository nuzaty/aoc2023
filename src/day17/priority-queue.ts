class PriorityQueue<Type> {
    values: {node: Type; priority: number}[] = [];

    enqueue(node: Type, priority: number): void {
        let flag = false;
        for (let i = 0; i < this.values.length; i++) {
            if (this.values[i].priority > priority) {
                this.values.splice(i, 0, {node, priority});
                flag = true;
                break;
            }
        }
        if (!flag) {
            this.values.push({node, priority});
        }
    }

    dequeue(): {node: Type; priority: number} | undefined {
        return this.values.shift();
    }

    size(): number {
        return this.values.length;
    }
}

export default PriorityQueue;
