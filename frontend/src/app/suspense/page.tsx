
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SuspensePage = async () => {
  await wait(3000);

  return (
    <div>
      Hi
    </div>
  );
}

export default SuspensePage;