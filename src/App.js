import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';
import { Input, Button, List, Avatar, Image, Divider } from 'antd';
import ReactMarkdown from 'react-markdown';
import ReactLoading from 'react-loading';

import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	useHistory,
	useLocation,
	useParams,
} from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';

export default function App() {
	return (
		<Router>
			<div style={{ margin: 20 }}>
				<Switch>
					<Route path="/readme/:id">
						<ReadMe />
					</Route>

					<Route path="/">
						<Home />
					</Route>
				</Switch>
			</div>
		</Router>
	);
}

function Home() {
	const [loadingUser, SetLoadingUser] = useState(false);
	const [loadingRepos, SetLoadingRepos] = useState(false);
	const [key, SetKey] = useState('');
	const [user, setUser] = useState('');
	const [repos, setRepos] = useState([]);

	let history = useHistory();

	const search = key => {
		SetLoadingUser(true);
		fetch(`https://api.github.com/users/${key}`, {
			header: {
				Accept: 'application/vnd.github.v3+json',
			},
		})
			.then(res => {
				SetLoadingUser(false);
				res.json().then(data => {
					setUser(data);
					SetLoadingRepos(true);
					fetch(data.repos_url)
						.then(res => {
							res.json().then(data => {
								SetLoadingRepos(false);
								setRepos(data);
							});
						})
						.catch(err => {
							SetLoadingRepos(false);
						});
				});
			})
			.catch(err => {
				SetLoadingUser(false);
			});
	};

	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
				<Input
					style={{ width: 200, marginRight: 10 }}
					placeholder="Enter user name"
					onChange={event => SetKey(event.target.value)}
				/>
				<Button
					type="primary"
					shape="circle"
					icon={<SearchOutlined />}
					onClick={() => search(key)}
				/>
			</div>
			<div style={{ display: 'flex', flexDirection: 'row', marginTop: 20 }}>
				<div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
					{loadingUser && (
						<div
							style={{
								height: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<ReactLoading
								type={'bubbles'}
								color={'#ededed'}
								height={'20%'}
								width={'20%'}
							/>
						</div>
					)}
					{!loadingUser && user && (
						<>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									marginBottom: 20,
								}}
							>
								<Image
									style={{
										borderRadius: 10,
										boxShadow: '-10px 21px 22px -17px rgba(0,0,0,0.75)',
									}}
									width={200}
									src={user.avatar_url}
								></Image>
							</div>
							<div style={{ display: 'flex', flexDirection: 'row' }}>
								<p>Name: </p>
								<p style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 20 }}>
									{user.name}
								</p>
							</div>
							<div style={{ display: 'flex', flexDirection: 'row' }}>
								<p>Bio:</p>
								<p style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 20 }}>
									{user.bio || '--'}
								</p>
							</div>
							<div style={{ display: 'flex', flexDirection: 'row' }}>
								<p>No. of repos:</p>
								<p style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 20 }}>
									{user.public_repos || '--'}
								</p>
							</div>
							<div style={{ display: 'flex', flexDirection: 'row' }}>
								<p>Location: </p>
								<p style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 20 }}>
									{user.location || '--'}
								</p>
							</div>
							<div style={{ display: 'flex', flexDirection: 'row' }}>
								<p>Git URL: </p>
								<a
									target="_blank"
									href={user.html_url}
									style={{
										fontWeight: 'bold',
										marginLeft: 10,
										fontSize: 20,
										color: 'black',
									}}
								>
									{user.html_url}
								</a>
							</div>
						</>
					)}
				</div>
				<div style={{ display: 'flex', flex: 2, flexDirection: 'column' }}>
					<Divider orientation="left">
						{user
							? `${user.name}'s Repository List`
							: 'Please search for a repository'}
					</Divider>
					<List
						itemLayout="horizontal"
						loading={loadingRepos}
						dataSource={repos}
						renderItem={item => (
							<List.Item
								style={{ cursor: 'pointer' }}
								onClick={() => {
									fetch(`${item.url}/readme`, {
										header: {
											Accept: 'application/vnd.github.v3+json',
										},
									}).then(res => {
										res.json().then(data => {
											history.push({
												pathname: `/readme/${item.name}`,
												state: {
													detail: data,
												},
											});
										});
									});
								}}
							>
								<List.Item.Meta
									avatar={
										<Avatar src="https://visualpharm.com/assets/232/Repository-595b40b85ba036ed117da940.svg" />
									}
									title={`${item.name} (${item.language})`}
									description={item.description}
								/>
							</List.Item>
						)}
					/>
				</div>
			</div>
		</div>
	);
}

function ReadMe() {
	const location = useLocation();

	const [data, setData] = useState(location.state);
	const [source, setSource] = useState(data.download_url);

	const { id } = useParams();

	useEffect(() => {
		fetch(data.detail.download_url)
			.then(response => response.text())
			.then(text => {
				setSource(text);
			});
	}, []);

	var encodedStringBtoA = atob(data.detail.content);

	return (
		<div>
			<h2>{id}'s Read me</h2>
			<ReactMarkdown source={source} />
		</div>
	);
}
