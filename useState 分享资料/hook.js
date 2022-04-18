const fiber = {
    // 对应着本App组件
    type: "FunctionComponent", // 该组件的类型
    Node: App, // 所对应的组件
    memoizedState: null // 连接所有hook对象的起点
  };
  
  let workInProgressHook = null; // 用来指向当前正在工作的hook的指针
  let mountOrUpdate = true; // 表示当前组件是 mountProgress 还是 updateProgress，起初应该是true
  
  function useState(initialState) {
    // useState的实现
  
    const state =
      typeof initialState === "function" ? initialState() : initialState; // 关注
    let hook;
  
    if (mountOrUpdate) {
      // mountProgress阶段,拼接所有的hook
      hook = {
        memoizedState: state,
        next: null,
        queue: {
          pending: null // 这个始终指向 quue 的最后一个 update 对象
        }
      };
  
      if (!fiber.memoizedState) {
        // 第一次使用useState
        fiber.memoizedState = workInProgressHook = hook;
      }
  
      workInProgressHook = workInProgressHook.next = hook;
    } else {
      hook = workInProgressHook; // 更新的时候，hook应该是为当前正在运行的hook的指针
      let baseState = hook.memoizedState;
      if (hook.queue.pending) {
        // 说明有更更新操作，将其遍历完
        let firstAction = hook.queue.pending.next;
        do {
          baseState =
            typeof firstAction.action === "function"
              ? firstAction.action(baseState)
              : firstAction.action;
          firstAction = firstAction.next;
        } while (firstAction !== hook.queue.pending);
        hook.memoizedState = baseState;
        hook.queue.pending = null;
      }
  
      workInProgressHook = workInProgressHook.next;
    }
  
    return [hook.memoizedState, dispatchAction.bind(null, hook)];
  }
  function renderWithHooks() {
    // render函数
    workInProgressHook = fiber.memoizedState; // 每次渲染，就应该把 workInProgressHook 指针指回开头（复原）
    const app = fiber.Node();
    mountOrUpdate = false; // 只要render了，后续都应该是 updateProgres s阶段了
    return app;
  }
  function dispatchAction(hook, action) {
    // 更新操作
  
    const update = {
      action,
      next: null
    };
  
    if (!hook.queue.pending) {
      // 第一次setXxx()
      update.next = update;
      hook.queue.pending = update;
    } else {
      update.next = hook.queue.pending.next;
      hook.queue.pending.next = update;
      hook.queue.pending = update;
    }
  
    window.app = renderWithHooks();
  }
  
 
  
  function App() {
    // App组件
    const [count, setCount] = useState(0); // 关注
    const [num, setNum] = useState(() => 10); // 关注
  
    document.getElementById("count").innerHTML = `${count}`;
    document.getElementById("num").innerHTML = `${num}`;
    console.log(`count的值:${count}，num的值:${num}`);
  
    return {
      handleCount: () => {
        // 关注
        setCount(count + 1);
      },
      handleNum: () => {
        // 关注
  
        setNum((num) => num + 10);
      }
    };
  }
  
  window.app = renderWithHooks();
  