import { React, useEffect, useState } from 'react';
import 'antd/dist/antd.css';
import './Sider.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { Layout, Menu, AutoComplete, Button } from 'antd';

import {
  HomeOutlined,
  GlobalOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  LoginOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const recipes = [
  { value: 'Recent Search 1' },
  { value: 'Recipe 2' },
  { value: 'Recipe 3' },
];

const SideBar = () => {
  const [reg, setReg] = useState(false);
  const [name, setName] = useState('');
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const userRes = await axios({
        method: 'get',
        timeout: 1000,
        url: `/api/current_user`,
      });
      const data = userRes.data;
      setName(data.displayName.split(' ')[0]);
      setReg(true);
    } catch (err) {
      setReg(false);
      console.log(err);
    }
  };

  const signOut = async () => {
    try {
      const outRes = await axios({
        method: 'get',
        timeout: 1000,
        url: `/auth/logout`,
      });
      const outd = outRes.data;
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout>
      <Sider
        width="280"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          backgroundColor: 'white',
          left: 0,
        }}
      >
        <a href={'/home'}>
          <div className="logo">
            <img
              className="riceimage"
              src={process.env.PUBLIC_URL + '/logo-blue.png'}
              alt="rice logo"
            />
            <div className="title">Rice Bowl</div>
          </div>
        </a>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: 15,
            paddingTop: 10,
          }}
        >
          <AutoComplete
            style={{ width: 230 }}
            placeholder="Search Recipes"
            options={recipes}
          />
        </div>
        <Menu mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item
            className="itemClass"
            key="1"
            icon={<HomeOutlined className="itemIcon" />}
          >
            <Link to="/home">Home</Link>
          </Menu.Item>
          <Menu.Item
            className="itemClass"
            key="2"
            icon={<GlobalOutlined className="itemIcon" />}
          >
            Browse
          </Menu.Item>
          <Menu.Item
            className="itemClass"
            key="3"
            icon={<CalendarOutlined className="itemIcon" />}
          >
            <Link to="/mealplanner">Meal Planner</Link>
          </Menu.Item>
          <Menu.Item
            className="itemClass"
            key="4"
            icon={<ShoppingCartOutlined className="itemIcon" />}
          >
            Cart
          </Menu.Item>
        </Menu>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
          }}
        >
          <Link to="/">
            {reg ? (
              <Button
                className="signButton"
                onClick={signOut}
                icon={<LogoutOutlined className="BtnIcon" />}
              >
                Sign Out
              </Button>
            ) : (
              <Button
                className="signButton"
                icon={<LoginOutlined className="BtnIcon" />}
              >
                Sign In
              </Button>
            )}
          </Link>
          {reg ? <Button className="userButton">Hi, {name}</Button> : null}
        </div>
      </Sider>
    </Layout>
  );
};

export default SideBar;
