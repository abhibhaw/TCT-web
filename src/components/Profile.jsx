import { message, Table, Image, Modal, Button } from "antd";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { uid } from "uid";
import { CheckCircleTwoTone } from '@ant-design/icons';


export default function Profile(props) {
    const { user, account } = useMoralis();
    const [username, setUsername] = useState("");
    const [updateToggle, setUpdateToggle] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tweetUID, setTweetUID] = useState("");
    const [tweetURL, setTweetURL] = useState("");
    const [twitterProfile, setTwitterProfile] = useState("");

    const contractProcessor = useWeb3ExecuteFunction();
    
    const showModal = () => {
        setIsModalVisible(true);
    };
    
    const handleOk = () => {
        setLoading(false);
        setIsModalVisible(false);
      };
    
      const handleCancel = () => {
        setIsModalVisible(false);
      };

    useEffect(() => {
        if (user?.get("username")) {
        setUsername(user.get("username"));
        }
    }, [user]);

    const fetchTwitterAccount = async () => {
        const options = {
            contractAddress: process.env.REACT_APP_TCT_CONTRACT,
            functionName: "getTwitterVerificationStatus",
            abi: [{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"getTwitterVerificationStatus","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}],
            params: {       
                _account: account,
            },
            msgValue: 0,
        }
        await contractProcessor.fetch({
            params: options,
            onComplete: (res) => {
                console.log("res complete", res);
            },
            onSuccess: (res) => {
                console.log("res", res);
                setTwitterProfile(res);
            },
            onError: (err) => {
                console.log("err", err);
            }
        });
    }

    const verifyTweet = async () => {
        const tweetID = tweetURL.split("/")[5];
        console.log(tweetID, tweetUID);
        let options = {
            contractAddress: process.env.REACT_APP_TCT_CONTRACT,
            functionName: "requestTwitterVerification",
            abi: [{"inputs":[{"internalType":"string","name":"_tweet","type":"string"},{"internalType":"string","name":"_randid","type":"string"}],"name":"requestTwitterVerification","outputs":[{"internalType":"bytes32","name":"requestId","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"}],
            params: {       
                _tweet: tweetID,
                _randid: tweetUID
            },
            msgValue: 0,
        }
        setLoading(true);
          await contractProcessor.fetch({
            params: options,
            onComplete: (res) => {
                console.log("res", res);
                handleOk();
                message.success("Tweet Verification Requested");
            },
            onSuccess: (res) => {
              console.log("res", res);
            },
            onError: (err) => {
              console.log("err", err);
            }
          });
    }

    useEffect(() => {
        const checkExistingAccounts = async () => {
            console.log(account);
            await fetchTwitterAccount();
        }
        // if(!account)
        //     checkExistingAccounts();        
        if (account)
            checkExistingAccounts();
    }, [account]);

    useEffect(() => {
        
        // generate uid if not present in localstorage        
        if (!localStorage.getItem("uid")) {
            const uidd = uid(20);
            setTweetUID(uidd);
            localStorage.setItem("uid",uidd);
        } else {
            setTweetUID(localStorage.getItem("uid"));
        }
    }, []);

    const updateUsername = async (username) => {       
        user.set("username", username);
        user.save().then(() => {
            message.success("Username updated successfully");
            setUpdateToggle(false);
        });
      };
    return (
        <div style={{width:"70%"}}>
        <div className="header" style={{fontSize:"20px",marginBottom:"40px",textAlign:"center"}}>            
            {updateToggle ? <>
                <h1 style={{ display: "inline", marginRight:"10px"  }}><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} /></h1>
                <button onClick={() => updateUsername(username)}>Update</button>
                </>
                : <>
                    <h1 style={{ display: "inline", marginRight:"10px" }}>{username}</h1>
                    <button onClick={() => setUpdateToggle(true)}>Edit</button>
                    </>
                }
            
        </div>
        <div className="body">
                <Table columns={[
                    {
                        title: 'Platform',
                        dataIndex: 'platform',
                        key: 'platform',
                    },
                    {
                        title: 'Action',
                        dataIndex: 'action',
                        key: 'action',
                    },
                    {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                    },                    
                    {
                        title: 'Weightage',
                        dataIndex: 'weightage',
                        key: 'weightage',
                    }
                ]} dataSource={[
                    {
                        platform: <Image height="50px" width="50px" src="https://i0.wp.com/www.chalearning.ca/wp-content/uploads/2021/03/pnglot.com-twitter-bird-logo-png-139932.png?ssl=1" />,
                        action: twitterProfile === "" ? <Button onClick={showModal}>Twitter</Button> : <a href={"https://twitter.com/"+twitterProfile}>{twitterProfile}</a>,
                        status: twitterProfile  ==="" ? "Not verified":<p>Verified <CheckCircleTwoTone twoToneColor="#52c41a" /> </p>,
                        weightage: '100%',
                    },
                    ]} pagination={false} />
                    <Modal
                        title="Verify Twitter"
                        visible={isModalVisible}
                        onOk={verifyTweet}
                        onCancel={handleCancel}    
                        okText="Verify"
                        confirmLoading={loading}
                    >
                    <p>Make the following Tweet from your account</p>
                    <br></br>
                    <p style={{ border: "1px solid gold", padding: "10px", textAlign: "center" }}>
                        I'm verifying my account {tweetUID} on The Collective Truth.
                    </p>
                    <div style={{textAlign:"center",marginTop:"10px"}}>
                        <input onChange={(e)=>setTweetURL(e.target.value)} value={tweetURL} style={{width:"80%"}} placeholder="Tweet URL goes here" /> 
                    </div>
                    </Modal>
        </div>
        </div>
    )
}

