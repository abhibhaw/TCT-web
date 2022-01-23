import React, { useState, useEffect } from "react";
import { useMoralis, useNFTBalances, useWeb3ExecuteFunction } from "react-moralis";
import { Card, Image, Tooltip, Modal, Input, Skeleton, Button } from "antd";
import { FileSearchOutlined, SendOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import api from "api";

const { Meta } = Card;

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    width: "100%",
    gap: "10px",
  },
};

function NFTBalance() {   
  const { Moralis, chainId, account } = useMoralis();
  const { verifyMetadata } = useVerifyMetadata();
  const contractProcessor = useWeb3ExecuteFunction();

  const [nfts, setNFTs] = useState([]);
  const [loading, setLoading] = useState(false);

  const requestNFTVerification = async (nft) => {
    console.log("nft="+nft+"&owner="+account+"&chain="+chainId);
    let options = {
      contractAddress: process.env.REACT_APP_TCT_CONTRACT,
      functionName: "requestNFTVerification",
      abi: [{"inputs":[{"internalType":"string","name":"_queryParams","type":"string"}],"name":"requestNFTVerification","outputs":[{"internalType":"bytes32","name":"requestId","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"}],
      params: {       
        _queryParams: "nft="+nft+"&owner="+account+"&chain="+chainId,
      },
      msgValue: 0,
    }
    await contractProcessor.fetch({
      params: options,
      onComplete: (res) => {
        console.log("res", res);
      },
      onSuccess: (res) => {
        console.log("res", res);
      },
      onError: (err) => {
        console.log("err", err);
      }
    });
  }
  
  const fetchNFTstatus = async (nft) => {    
      const options = {
        contractAddress: process.env.REACT_APP_TCT_CONTRACT,
        functionName: "getNFTRequestStatus",
        abi: [{ "inputs": [{ "internalType": "string", "name": "_queryParams", "type": "string" }], "name": "getNFTRequestStatus", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }],
        params: {
          _queryParams: "nft=" + nft + "&owner=" + account + "&chain=" + chainId,
        },
        msgValue: 0,
      }
      let status = 0;
      await contractProcessor.fetch({
        params: options,
        onComplete: (res) => {
          console.log("res complete", res);
        },
        onSuccess: (res) => {
          console.log("res", res);
          status = res;
        },
        onError: (err) => {
          console.log("err", err);
        }
      });

      return status;
  }

  useEffect(() => { 
    const fetchNFTs = async () => {
      if (account && !loading) {
        setLoading(true);
        const NFTBalances = await api.nft.fetchAll(account);
        const allNFTs = await Promise.all(NFTBalances.map(async (NFTBalance) => {
          const hydratedNFTs = await Promise.all(NFTBalance.balance.map(async nft => { 
            const status = await fetchNFTstatus(nft.token_address);
            const metadata = await JSON.parse(nft.metadata);
            const image = metadata.image;
            return {
              ...nft,
              status: status,
              image: image
            }
          }));
          return {
            chain: NFTBalance.chain,
            balance: hydratedNFTs,
          }
        }));
        setNFTs(allNFTs);
        setLoading(false);
      }
    }
    fetchNFTs();
  }, [account]);

  
  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <div>
        <Skeleton loading={loading}>
          {nfts.length!==0 &&
            nfts.map(nft => nft.balance.length !==0 && (
              <div key={nft.chain}>
                <h1>{nft.chain.toUpperCase()}</h1>
                <div style={styles.NFTs}>
                {nft.balance.map((nft, index) => {
                  return (
                    <Card
                      hoverable
                      actions={[                    
                        <Tooltip title="View On Blockexplorer">
                          <FileSearchOutlined
                            onClick={() => window.open(`${getExplorer(chainId)}address/${nft.token_address}`, "_blank")}
                          />
                        </Tooltip>,
                        <Tooltip title="Transfer NFT">
                          <SendOutlined />
                        </Tooltip>,
                        <Tooltip title="Sell On OpenSea">
                          <ShoppingCartOutlined onClick={() => alert("OPENSEA INTEGRATION COMING!")} />
                        </Tooltip>,
                      ]}
                      style={{ width: 240, border: "2px solid #e7eaf3" }}
                      cover={
                        <Image
                          preview={false}
                          src={"https://gateway.pinata.cloud/ipfs/QmZjsYRDB2yMThJ5gPLRixpXc8QLpPVFd1rtbDPr3Vj72U" || "error"}
                          fallback="data:image/png;base64,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"
                          alt=""
                          style={{ height: "300px" }}
                        />
                      }
                      key={index}
                    >
                      <Meta title={nft.name} description={nft.token_address} />
                      {nft.status === "0" ?
                        <Button onClick={() => requestNFTVerification(nft.token_address)} type="primary" style={{ width: "100%", marginTop: "10px" }}>Register NFT</Button>
                        : <Button>Verified</Button>}
                    </Card>
                  );
                })}   
                </div>  
              </div>              
            ))
          }
        </Skeleton>
      </div>      
    </div>
  );
}

export default NFTBalance;
