import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DB, auth } from "../../firebase-config";
import { FaEdit, FaSave, FaTimes, FaPlus, FaTrash, FaLink } from "react-icons/fa";
import { RiTwitterFill, RiInstagramFill, RiFacebookBoxFill, RiDiscordFill, RiTwitchFill, RiYoutubeFill } from 'react-icons/ri';

const platformIcons = {
  'twitter': <RiTwitterFill />,
  'instagram': <RiInstagramFill />,
  'facebook': <RiFacebookBoxFill />,
  'discord': <RiDiscordFill />,
  'twitch': <RiTwitchFill />,
  'youtube': <RiYoutubeFill />,
  'link': <FaLink />
};

const SocialLinks = ({ user }) => {
  const [links, setLinks] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newLink, setNewLink] = useState('');
  const [activeTab, setActiveTab] = useState('view');

  useEffect(() => {
    const fetchLinks = async () => {
      const userRef = doc(DB, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists() && docSnap.data().links) {
        setLinks(docSnap.data().links);
      }
    };
    fetchLinks();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(DB, 'users', auth.currentUser.uid), {
        links: links
      }, { merge: true });
      setEditing(false);
      setActiveTab('view');
    } catch (error) {
      console.error("Error saving links:", error);
    }
  };

  const addLink = () => {
    if (newLink) {
      let platform = 'Custom';
      try {
        const domain = new URL(newLink).hostname.replace('www.', '');
        if (domain.includes('twitter.com') || domain.includes('x.com')) platform = 'Twitter';
        else if (domain.includes('instagram.com')) platform = 'Instagram';
        else if (domain.includes('facebook.com')) platform = 'Facebook';
        else if (domain.includes('youtube.com')) platform = 'YouTube';
        else if (domain.includes('twitch.tv')) platform = 'Twitch';
        else if (domain.includes('discord.gg')) platform = 'Discord';
        else platform = domain.split('.')[0];
        platform = platform.charAt(0).toUpperCase() + platform.slice(1);
      } catch {
        platform = 'Link';
      }

      setLinks([...links, { platform, url: newLink }]);
      setNewLink('');
    }
  };

  const getPlatformIcon = (platform) => {
    const lowerPlatform = platform.toLowerCase();
    return platformIcons[lowerPlatform] || platformIcons['link'];
  };

  return (
    <div className="links-container">
      <div className="links-header">
        <h2><FaLink size={20} /> MY SOCIAL LINKS</h2>
        <div className="links-actions">
          <button 
            onClick={() => {
              setEditing(!editing);
              setActiveTab(editing ? 'view' : 'edit');
            }}
            className={`edit-button ${activeTab === 'edit' ? 'active' : ''}`}
          >
            {editing ? <FaTimes /> : <FaEdit />}
            {editing ? 'Cancel' : 'Manage Links'}
          </button>
          {editing && (
            <button onClick={handleSave} className="save-button">
              <FaSave /> Save Changes
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div className="add-link-form">
          <h3>Add New Link</h3>
          <div className="link-input-container">
            <input
              type="url"
              placeholder="https://example.com"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              className="link-input"
            />
            <button onClick={addLink} className="add-button">
              <FaPlus /> Add Link
            </button>
          </div>
        </div>
      )}

      <div className="links-grid">
        {links.map((link, index) => (
          <div key={index} className={`link-card ${editing ? 'editable' : ''}`}>
            {editing && (
              <button 
              onClick={() => setLinks(links.filter(((_, i) => i !== index)))} 
                className="delete-link"
              >
                <FaTrash size={12} />
              </button>
            )}
            <div className="link-platform">
              <div className="platform-icon">
                {getPlatformIcon(link.platform)}
              </div>
              <h3>{link.platform}</h3>
            </div>
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="link-url"
            >
              {link.url}
            </a>
          </div>
        ))}
        {links.length === 0 && (
          <div className="empty-links">
            {editing ? 'Add your first social link by entering a URL above!' : 'No social links added yet'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialLinks;