import { useEffect } from "react";
import { message } from "antd";
import { useChain, useMoralis } from "react-moralis";



function Chains() {
  const { switchNetwork, chainId } = useChain();
  const { isAuthenticated } = useMoralis();

  useEffect(() => {
    if (!chainId) return null;
    if (chainId !== "0x2a") {
      message.warning("We only support Kovan Testnet. Please switch to Kovan Testnet.");
      switchNetwork("0x2a").then((res) => {
        message.success("Thank You. Switched to Kovan Testnet.");
      }).catch((err) => {
        console.log(err);
        message.error("Failed to switch to Kovan Testnet. Please try again!");
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);


  if (!chainId || !isAuthenticated) return null;

  return (
    <div>
    </div>
  );
}

export default Chains;
