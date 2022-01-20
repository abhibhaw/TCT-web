import { message, Table, Image, Modal, Button } from "antd";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";

export default function Profile(props) {
    const { user, account } = useMoralis();
    const [username, setUsername] = useState("");
    const [updateToggle, setUpdateToggle] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => {
        setIsModalVisible(true);
    };
    
      const handleOk = () => {
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
                        action: <Button onClick={showModal}>Twitter</Button>,
                        status: "Not verified",
                        weightage: '100%',
                    },
                    ]} pagination={false} />
                    <Modal
                        title="Verify Twitter"
                        visible={isModalVisible}
                        onOk={handleOk}
                        onCancel={handleCancel}    
                        okText="Verify"
                    >
                    <p>Make the following Tweet from your account</p>
                    <br></br>
                    <p style={{ border: "1px solid gold", padding: "10px", textAlign: "center" }}>
                        I'm verifying my wallet {account} on The Collective Truth.
                    </p>
                    <div style={{textAlign:"center",marginTop:"10px"}}>
                        <input style={{width:"80%"}} placeholder="Tweet URL goes here" /> 
                    </div>
                    </Modal>
        </div>
        </div>
    )
}

