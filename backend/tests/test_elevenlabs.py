import unittest
from unittest.mock import patch, MagicMock
from fluffyduck.backend.agents import respond_to_incoming_call_with_elevenlabs

class TestRespondToIncomingCall(unittest.TestCase):

    @patch('fluffyduck.backend.agents.requests.post')
    def test_respond_to_incoming_call(self, mock_post):
        # Arrange: Set up the mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {"status": "success", "message": "Call initiated"}
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        # Act: Call the function
        response = respond_to_incoming_call_with_elevenlabs(phone="+19038516387")

        # Assert: Check if the response is as expected
        self.assertEqual(response, {"status": "success", "message": "Call initiated"})
        mock_post.assert_called_once_with(
            'https://api.elevenlabs.io/v1/calls',
            json=unittest.mock.ANY,
            headers={'Authorization': 'your-elevenlabs-api-key'}
        )

if __name__ == "__main__":
    unittest.main()